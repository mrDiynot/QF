using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Auth.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of Salesforce OAuth service for CRM integration.
/// Handles OAuth flow, token exchange, and CRM provider setup.
/// </summary>
[SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via DI")]
[SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "Salesforce OAuth endpoints are stable")]
[SuppressMessage("Performance", "CA1848:Use the LoggerMessage delegates", Justification = "LoggerMessage delegates add complexity without significant performance benefit")]
public partial class SalesforceOAuthService : ISalesforceOAuthService
{
    private const string SalesforceAuthEndpoint = "https://login.salesforce.com/services/oauth2/authorize";
    private const string SalesforceTokenEndpoint = "https://login.salesforce.com/services/oauth2/token";
    private const string OAuthStateCachePrefix = "salesforce_oauth_state_";

    private readonly QualiFlowDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<SalesforceOAuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SalesforceOAuthService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="configuration">Configuration.</param>
    /// <param name="httpClientFactory">HTTP client factory.</param>
    /// <param name="cache">Memory cache.</param>
    /// <param name="logger">Logger.</param>
    public SalesforceOAuthService(
        QualiFlowDbContext context,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<SalesforceOAuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task<OAuthInitiateResponse> InitiateOAuthAsync(
        Guid businessId,
        string? returnUrl = null,
        CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["CRM:Salesforce:ClientId"]
            ?? throw new InvalidOperationException("Salesforce OAuth ClientId not configured");
        var callbackPath = _configuration["CRM:Salesforce:CallbackPath"] ?? "/api/v1/crm/salesforce/callback";

        var state = GenerateSecureState();
        var stateData = new SalesforceOAuthStateData
        {
            BusinessId = businessId,
            ReturnUrl = returnUrl,
            CreatedAt = DateTime.UtcNow,
        };
        _cache.Set($"{OAuthStateCachePrefix}{state}", stateData, TimeSpan.FromMinutes(10));

        var redirectUri = GetRedirectUri(callbackPath);
        var authUrl = $"{SalesforceAuthEndpoint}?response_type=code" +
                      $"&client_id={Uri.EscapeDataString(clientId)}" +
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                      $"&state={Uri.EscapeDataString(state)}";

        _logger.LogInformation("Salesforce OAuth initiated for business {BusinessId}", businessId);

        return Task.FromResult(new OAuthInitiateResponse
        {
            AuthorizationUrl = authUrl,
            State = state,
            Provider = "Salesforce",
        });
    }

    /// <inheritdoc />
    public async Task<CRMOAuthCallbackResponse> HandleCallbackAsync(
        string code,
        string state,
        CancellationToken cancellationToken = default)
    {
        if (!await ValidateStateAsync(state, cancellationToken))
        {
            return new CRMOAuthCallbackResponse
            {
                Success = false,
                ErrorMessage = "Invalid or expired OAuth state",
            };
        }

        var stateData = _cache.Get<SalesforceOAuthStateData>($"{OAuthStateCachePrefix}{state}");
        if (stateData == null)
        {
            return new CRMOAuthCallbackResponse
            {
                Success = false,
                ErrorMessage = "OAuth state data not found",
            };
        }

        try
        {
            var tokenResponse = await ExchangeCodeForTokensAsync(code, cancellationToken);
            var userInfo = await GetUserInfoAsync(tokenResponse.AccessToken, tokenResponse.InstanceUrl, cancellationToken);

            var crmProvider = await CreateOrUpdateCRMProviderAsync(
                stateData.BusinessId,
                tokenResponse,
                userInfo,
                cancellationToken);

            _logger.LogInformation(
                "Salesforce OAuth completed for business {BusinessId}, CRM provider {ProviderId}",
                stateData.BusinessId,
                crmProvider.Id);

            return new CRMOAuthCallbackResponse
            {
                Success = true,
                CRMProviderId = crmProvider.Id,
                ProviderType = "Salesforce",
                ExternalAccountId = userInfo.OrganizationId,
                ExternalAccountUrl = tokenResponse.InstanceUrl,
                ReturnUrl = stateData.ReturnUrl,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Salesforce OAuth callback failed for business {BusinessId}", stateData.BusinessId);
            return new CRMOAuthCallbackResponse
            {
                Success = false,
                ErrorMessage = ex.Message,
                ReturnUrl = stateData.ReturnUrl,
            };
        }
    }

    /// <inheritdoc />
    public async Task<bool> RefreshTokenAsync(Guid crmProviderId, CancellationToken cancellationToken = default)
    {
        var provider = await _context.CRMProviders.FindAsync([crmProviderId], cancellationToken);
        if (provider == null || provider.RefreshToken == null)
        {
            return false;
        }

        try
        {
            var tokenResponse = await RefreshAccessTokenAsync(provider.RefreshToken, cancellationToken);

            provider.AccessToken = tokenResponse.AccessToken;
            provider.TokenExpiresAt = DateTime.UtcNow.AddSeconds(3600); // Salesforce tokens typically expire in 1 hour
            provider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Salesforce access token refreshed for CRM provider {ProviderId}", crmProviderId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to refresh Salesforce token for CRM provider {ProviderId}", crmProviderId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ValidateConnectionAsync(Guid crmProviderId, CancellationToken cancellationToken = default)
    {
        var provider = await _context.CRMProviders.FindAsync([crmProviderId], cancellationToken);
        if (provider == null || provider.AccessToken == null || provider.ExternalAccountUrl == null)
        {
            return false;
        }

        try
        {
            await GetUserInfoAsync(provider.AccessToken, provider.ExternalAccountUrl, cancellationToken);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static string GenerateSecureState()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .Replace("=", string.Empty, StringComparison.Ordinal);
    }

    private Task<bool> ValidateStateAsync(string state, CancellationToken cancellationToken)
    {
        _ = cancellationToken; // Parameter required for interface consistency
        var exists = _cache.TryGetValue($"{OAuthStateCachePrefix}{state}", out _);
        return Task.FromResult(exists);
    }

    private string GetRedirectUri(string callbackPath)
    {
        var baseUrl = _configuration["App:BaseUrl"] ?? "https://localhost:5001";
        return $"{baseUrl}{callbackPath}";
    }

    private async Task<SalesforceTokenResponse> ExchangeCodeForTokensAsync(string code, CancellationToken ct)
    {
        var clientId = _configuration["CRM:Salesforce:ClientId"]!;
        var clientSecret = _configuration["CRM:Salesforce:ClientSecret"]!;
        var callbackPath = _configuration["CRM:Salesforce:CallbackPath"] ?? "/api/v1/crm/salesforce/callback";
        var redirectUri = GetRedirectUri(callbackPath);

        using var client = _httpClientFactory.CreateClient();
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["grant_type"] = "authorization_code",
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["redirect_uri"] = redirectUri,
            ["code"] = code,
        });

        var response = await client.PostAsync(new Uri(SalesforceTokenEndpoint), content, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<SalesforceTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Salesforce token response");
    }

    private async Task<SalesforceTokenResponse> RefreshAccessTokenAsync(string refreshToken, CancellationToken ct)
    {
        var clientId = _configuration["CRM:Salesforce:ClientId"]!;
        var clientSecret = _configuration["CRM:Salesforce:ClientSecret"]!;

        using var client = _httpClientFactory.CreateClient();
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["grant_type"] = "refresh_token",
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["refresh_token"] = refreshToken,
        });

        var response = await client.PostAsync(new Uri(SalesforceTokenEndpoint), content, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<SalesforceTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Salesforce token response");
    }

    private async Task<SalesforceUserInfo> GetUserInfoAsync(string accessToken, string instanceUrl, CancellationToken ct)
    {
        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(new Uri($"{instanceUrl}/services/oauth2/userinfo"), ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<SalesforceUserInfo>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Salesforce user info");
    }

    private async Task<CRMProvider> CreateOrUpdateCRMProviderAsync(
        Guid businessId,
        SalesforceTokenResponse tokenResponse,
        SalesforceUserInfo userInfo,
        CancellationToken ct)
    {
        var existingProvider = await _context.CRMProviders
            .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.ProviderType == CRMProviderType.Salesforce, ct);

        if (existingProvider != null)
        {
            existingProvider.AccessToken = tokenResponse.AccessToken;
            existingProvider.RefreshToken = tokenResponse.RefreshToken;
            existingProvider.TokenExpiresAt = DateTime.UtcNow.AddSeconds(3600);
            existingProvider.ExternalAccountId = userInfo.OrganizationId;
            existingProvider.ExternalAccountUrl = tokenResponse.InstanceUrl;
            existingProvider.IsActive = true;
            existingProvider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
            return existingProvider;
        }

        var newProvider = new CRMProvider
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            ProviderType = CRMProviderType.Salesforce,
            AccessToken = tokenResponse.AccessToken,
            RefreshToken = tokenResponse.RefreshToken,
            TokenExpiresAt = DateTime.UtcNow.AddSeconds(3600),
            ExternalAccountId = userInfo.OrganizationId,
            ExternalAccountUrl = tokenResponse.InstanceUrl,
            IsActive = true,
            SyncStrategy = CRMSyncStrategy.Scheduled,
            CreatedAt = DateTime.UtcNow,
        };

        await _context.CRMProviders.AddAsync(newProvider, ct);
        await _context.SaveChangesAsync(ct);

        return newProvider;
    }

    private sealed class SalesforceOAuthStateData
    {
        public Guid BusinessId { get; set; }

        public string? ReturnUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    private sealed class SalesforceTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("instance_url")]
        public string InstanceUrl { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [JsonPropertyName("issued_at")]
        public string IssuedAt { get; set; } = string.Empty;

        [JsonPropertyName("signature")]
        public string Signature { get; set; } = string.Empty;
    }

    private sealed class SalesforceUserInfo
    {
        [JsonPropertyName("user_id")]
        public string UserId { get; set; } = string.Empty;

        [JsonPropertyName("organization_id")]
        public string OrganizationId { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }
}


