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
/// Implementation of HubSpot OAuth service for CRM integration.
/// Handles OAuth flow, token exchange, and CRM provider setup.
/// </summary>
[SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via DI")]
[SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "HubSpot OAuth endpoints are stable")]
[SuppressMessage("Performance", "CA1848:Use the LoggerMessage delegates", Justification = "LoggerMessage delegates add complexity without significant performance benefit")]
public partial class HubSpotOAuthService : IHubSpotOAuthService
{
    private const string HubSpotAuthEndpoint = "https://app.hubspot.com/oauth/authorize";
    private const string HubSpotTokenEndpoint = "https://api.hubapi.com/oauth/v1/token";
    private const string HubSpotAccountEndpoint = "https://api.hubapi.com/account-info/v3/details";
    private const string OAuthStateCachePrefix = "hubspot_oauth_state_";

    private readonly QualiFlowDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<HubSpotOAuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="HubSpotOAuthService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="configuration">Configuration.</param>
    /// <param name="httpClientFactory">HTTP client factory.</param>
    /// <param name="cache">Memory cache.</param>
    /// <param name="logger">Logger.</param>
    public HubSpotOAuthService(
        QualiFlowDbContext context,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IMemoryCache cache,
        ILogger<HubSpotOAuthService> logger)
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
        var clientId = _configuration["CRM:HubSpot:ClientId"]
            ?? throw new InvalidOperationException("HubSpot OAuth ClientId not configured");
        var callbackPath = _configuration["CRM:HubSpot:CallbackPath"] ?? "/api/v1/crm/hubspot/callback";

        var state = GenerateSecureState();
        var stateData = new HubSpotOAuthStateData
        {
            BusinessId = businessId,
            ReturnUrl = returnUrl,
            CreatedAt = DateTime.UtcNow,
        };
        _cache.Set($"{OAuthStateCachePrefix}{state}", stateData, TimeSpan.FromMinutes(10));

        var redirectUri = GetRedirectUri(callbackPath);
        var scopes = "crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write";
        var authUrl = $"{HubSpotAuthEndpoint}?client_id={Uri.EscapeDataString(clientId)}" +
                      $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                      $"&scope={Uri.EscapeDataString(scopes)}" +
                      $"&state={Uri.EscapeDataString(state)}";

        _logger.LogInformation("HubSpot OAuth initiated for business {BusinessId}", businessId);

        return Task.FromResult(new OAuthInitiateResponse
        {
            AuthorizationUrl = authUrl,
            State = state,
            Provider = "HubSpot",
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

        var stateData = _cache.Get<HubSpotOAuthStateData>($"{OAuthStateCachePrefix}{state}");
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
            var accountInfo = await GetAccountInfoAsync(tokenResponse.AccessToken, cancellationToken);

            var crmProvider = await CreateOrUpdateCRMProviderAsync(
                stateData.BusinessId,
                tokenResponse,
                accountInfo,
                cancellationToken);

            _logger.LogInformation(
                "HubSpot OAuth completed for business {BusinessId}, CRM provider {ProviderId}",
                stateData.BusinessId,
                crmProvider.Id);

            return new CRMOAuthCallbackResponse
            {
                Success = true,
                CRMProviderId = crmProvider.Id,
                ProviderType = "HubSpot",
                ExternalAccountId = accountInfo.PortalId.ToString(System.Globalization.CultureInfo.InvariantCulture),
                ExternalAccountUrl = $"https://app.hubspot.com/contacts/{accountInfo.PortalId}",
                ReturnUrl = stateData.ReturnUrl,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "HubSpot OAuth callback failed for business {BusinessId}", stateData.BusinessId);
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
            provider.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
            provider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("HubSpot access token refreshed for CRM provider {ProviderId}", crmProviderId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to refresh HubSpot token for CRM provider {ProviderId}", crmProviderId);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<bool> ValidateConnectionAsync(Guid crmProviderId, CancellationToken cancellationToken = default)
    {
        var provider = await _context.CRMProviders.FindAsync([crmProviderId], cancellationToken);
        if (provider == null || provider.AccessToken == null)
        {
            return false;
        }

        try
        {
            await GetAccountInfoAsync(provider.AccessToken, cancellationToken);
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

    private async Task<HubSpotTokenResponse> ExchangeCodeForTokensAsync(string code, CancellationToken ct)
    {
        var clientId = _configuration["CRM:HubSpot:ClientId"]!;
        var clientSecret = _configuration["CRM:HubSpot:ClientSecret"]!;
        var callbackPath = _configuration["CRM:HubSpot:CallbackPath"] ?? "/api/v1/crm/hubspot/callback";
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

        var response = await client.PostAsync(new Uri(HubSpotTokenEndpoint), content, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<HubSpotTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to deserialize HubSpot token response");
    }

    private async Task<HubSpotTokenResponse> RefreshAccessTokenAsync(string refreshToken, CancellationToken ct)
    {
        var clientId = _configuration["CRM:HubSpot:ClientId"]!;
        var clientSecret = _configuration["CRM:HubSpot:ClientSecret"]!;

        using var client = _httpClientFactory.CreateClient();
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["grant_type"] = "refresh_token",
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["refresh_token"] = refreshToken,
        });

        var response = await client.PostAsync(new Uri(HubSpotTokenEndpoint), content, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<HubSpotTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to deserialize HubSpot token response");
    }

    private async Task<HubSpotAccountInfo> GetAccountInfoAsync(string accessToken, CancellationToken ct)
    {
        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(new Uri(HubSpotAccountEndpoint), ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<HubSpotAccountInfo>(json)
            ?? throw new InvalidOperationException("Failed to deserialize HubSpot account info");
    }

    private async Task<CRMProvider> CreateOrUpdateCRMProviderAsync(
        Guid businessId,
        HubSpotTokenResponse tokenResponse,
        HubSpotAccountInfo accountInfo,
        CancellationToken ct)
    {
        var existingProvider = await _context.CRMProviders
            .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.ProviderType == CRMProviderType.HubSpot, ct);

        if (existingProvider != null)
        {
            existingProvider.AccessToken = tokenResponse.AccessToken;
            existingProvider.RefreshToken = tokenResponse.RefreshToken;
            existingProvider.TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);
            existingProvider.ExternalAccountId = accountInfo.PortalId.ToString(System.Globalization.CultureInfo.InvariantCulture);
            existingProvider.ExternalAccountUrl = $"https://app.hubspot.com/contacts/{accountInfo.PortalId}";
            existingProvider.IsActive = true;
            existingProvider.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
            return existingProvider;
        }

        var newProvider = new CRMProvider
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            ProviderType = CRMProviderType.HubSpot,
            AccessToken = tokenResponse.AccessToken,
            RefreshToken = tokenResponse.RefreshToken,
            TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn),
            ExternalAccountId = accountInfo.PortalId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            ExternalAccountUrl = $"https://app.hubspot.com/contacts/{accountInfo.PortalId}",
            IsActive = true,
            SyncStrategy = CRMSyncStrategy.Scheduled,
            CreatedAt = DateTime.UtcNow,
        };

        await _context.CRMProviders.AddAsync(newProvider, ct);
        await _context.SaveChangesAsync(ct);

        return newProvider;
    }

    private sealed class HubSpotOAuthStateData
    {
        public Guid BusinessId { get; set; }

        public string? ReturnUrl { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    private sealed class HubSpotTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("refresh_token")]
        public string RefreshToken { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;
    }

    private sealed class HubSpotAccountInfo
    {
        [JsonPropertyName("portalId")]
        public long PortalId { get; set; }

        [JsonPropertyName("timeZone")]
        public string TimeZone { get; set; } = string.Empty;

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = string.Empty;
    }
}


