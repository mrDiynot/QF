using System.Diagnostics.CodeAnalysis;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Auth.DTOs;
using QualiFlow.Application.Features.Auth.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of Microsoft OAuth service.
/// Handles OAuth flow, token exchange, and user account creation/linking.
/// </summary>
[SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via DI")]
[SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "Microsoft OAuth endpoints are stable")]
public partial class MicrosoftOAuthService : IMicrosoftOAuthService
{
    private const string MicrosoftAuthEndpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
    private const string OAuthStateCachePrefix = "ms_oauth_state_";

    private static readonly Uri MicrosoftTokenUri = new("https://login.microsoftonline.com/common/oauth2/v2.0/token");
    private static readonly Uri MicrosoftUserInfoUri = new("https://graph.microsoft.com/v1.0/me");

    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly QualiFlowDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MicrosoftOAuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MicrosoftOAuthService"/> class.
    /// </summary>
    /// <param name="configuration">The configuration.</param>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="userManager">The user manager.</param>
    /// <param name="jwtTokenService">The JWT token service.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    /// <param name="context">The database context.</param>
    /// <param name="cache">The memory cache.</param>
    /// <param name="logger">The logger.</param>
    public MicrosoftOAuthService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        UserManager<ApplicationUser> userManager,
        IJwtTokenService jwtTokenService,
        IUsageLimitService usageLimitService,
        QualiFlowDbContext context,
        IMemoryCache cache,
        ILogger<MicrosoftOAuthService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _usageLimitService = usageLimitService;
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task<OAuthInitiateResponse> InitiateOAuthAsync(
        string? returnUrl,
        Guid? businessId,
        CancellationToken cancellationToken = default)
    {
        var clientId = _configuration["Authentication:Microsoft:ClientId"]
            ?? throw new InvalidOperationException("Microsoft OAuth ClientId not configured");
        var callbackPath = _configuration["Authentication:Microsoft:CallbackPath"] ?? "/api/v1/auth/microsoft/callback";

        var state = GenerateSecureState();
        var stateData = new MicrosoftOAuthStateData
        {
            ReturnUrl = returnUrl,
            BusinessId = businessId,
            CreatedAt = DateTime.UtcNow,
        };
        _cache.Set($"{OAuthStateCachePrefix}{state}", stateData, TimeSpan.FromMinutes(10));

        var redirectUri = GetRedirectUri(callbackPath);
        var authUrl = BuildAuthorizationUrl(clientId, redirectUri, state);

        LogOAuthInitiated(_logger, returnUrl, businessId);

        return Task.FromResult(new OAuthInitiateResponse
        {
            AuthorizationUrl = authUrl,
            State = state,
            Provider = "Microsoft",
        });
    }

    /// <inheritdoc />
    public async Task<OAuthLoginResponse> HandleCallbackAsync(
        string code,
        string state,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        if (!await ValidateStateAsync(state, cancellationToken))
        {
            throw new InvalidOperationException("Invalid or expired OAuth state");
        }

        var stateData = _cache.Get<MicrosoftOAuthStateData>($"{OAuthStateCachePrefix}{state}");
        _cache.Remove($"{OAuthStateCachePrefix}{state}");

        var tokenResponse = await ExchangeCodeForTokensAsync(code, cancellationToken);
        var msUser = await GetMicrosoftUserInfoAsync(tokenResponse.AccessToken, cancellationToken);

        // Callback flow doesn't have selectedPlan, defaults to freeflow
        var (user, isNew) = await FindOrCreateUserAsync(msUser, stateData?.BusinessId, null, cancellationToken);

        // Update LastLoginAt for audit purposes
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var refreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        LogOAuthSuccess(_logger, user.Id, user.Email ?? string.Empty, isNew);

        return new OAuthLoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            TokenType = "Bearer",
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            BusinessId = user.BusinessId,
            IsNewUser = isNew,
            Provider = "Microsoft",
            ProfilePictureUrl = user.ProfilePictureUrl,
        };
    }

    /// <inheritdoc />
    public Task<bool> ValidateStateAsync(string state, CancellationToken cancellationToken = default)
    {
        var isValid = _cache.TryGetValue($"{OAuthStateCachePrefix}{state}", out _);
        return Task.FromResult(isValid);
    }

    /// <inheritdoc />
    public async Task<OAuthLoginResponse> AuthenticateWithIdTokenAsync(
        string idToken,
        string? ipAddress,
        string? selectedPlan = null,
        CancellationToken cancellationToken = default)
    {
        // Validate ID token and get user info
        var msUser = await ValidateIdTokenAsync(idToken, cancellationToken);

        // Find or create user (pass selectedPlan for new user subscription creation)
        var (user, isNewUser) = await FindOrCreateUserAsync(msUser, null, selectedPlan, cancellationToken);

        // Update LastLoginAt for audit purposes
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Generate JWT tokens
        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var refreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        LogOAuthSuccess(_logger, user.Id, user.Email ?? string.Empty, isNewUser);

        return new OAuthLoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            TokenType = "Bearer",
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            BusinessId = user.BusinessId,
            IsNewUser = isNewUser,
            Provider = "Microsoft",
            ProfilePictureUrl = user.ProfilePictureUrl,
        };
    }

#pragma warning disable S1172 // Remove unused parameter - kept for interface consistency
    private async Task<MicrosoftUserInfo> ValidateIdTokenAsync(
        string idToken,
        CancellationToken cancellationToken)
#pragma warning restore S1172
    {
        // Decode JWT to get claims without validation (Microsoft ID tokens are already validated by NextAuth)
        // The ID token from Microsoft contains the user info in its payload
        var parts = idToken.Split('.');
        if (parts.Length != 3)
        {
            throw new InvalidOperationException("Invalid ID token format");
        }

        // Decode the payload (middle part)
        var payload = parts[1];

        // Add padding if necessary
        payload = payload.PadRight(payload.Length + ((4 - (payload.Length % 4)) % 4), '=');
        payload = payload.Replace('-', '+').Replace('_', '/');

        var payloadBytes = Convert.FromBase64String(payload);
        var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);

        var claims = JsonSerializer.Deserialize<MicrosoftIdTokenClaims>(payloadJson)
            ?? throw new InvalidOperationException("Failed to parse ID token claims");

        // Validate audience (client ID)
        var clientId = _configuration["Authentication:Microsoft:ClientId"];
        if (!string.Equals(claims.Aud, clientId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("ID token was not issued for this application");
        }

        // Convert to MicrosoftUserInfo format
        return new MicrosoftUserInfo
        {
            Id = claims.Oid ?? claims.Sub ?? throw new InvalidOperationException("Missing user identifier in ID token"),
            Email = claims.Email ?? claims.PreferredUsername,
            DisplayName = claims.Name,
            UserPrincipalName = claims.PreferredUsername,
        };
    }

    // ============================================================================
    // LoggerMessage Definitions (Static)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Microsoft OAuth initiated. ReturnUrl={ReturnUrl}, BusinessId={BusinessId}")]
    private static partial void LogOAuthInitiated(ILogger logger, string? returnUrl, Guid? businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Microsoft OAuth success. UserId={UserId}, Email={Email}, IsNewUser={IsNewUser}")]
    private static partial void LogOAuthSuccess(ILogger logger, Guid userId, string email, bool isNewUser);

    // ============================================================================
    // Private Static Helper Methods
    // ============================================================================

    private static string GenerateSecureState()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');
    }

    [SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "Microsoft OAuth endpoints are stable")]
    private static string BuildAuthorizationUrl(string clientId, string redirectUri, string state)
    {
        var scopes = "openid email profile User.Read";
        return $"{MicrosoftAuthEndpoint}?" +
               $"client_id={Uri.EscapeDataString(clientId)}&" +
               $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
               $"response_type=code&" +
               $"scope={Uri.EscapeDataString(scopes)}&" +
               $"state={Uri.EscapeDataString(state)}&" +
               $"response_mode=query";
    }

    private static (string firstName, string lastName) ParseDisplayName(string? displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            return (firstName: string.Empty, lastName: string.Empty);
        }

        var parts = displayName.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        return parts.Length switch
        {
            0 => (firstName: string.Empty, lastName: string.Empty),
            1 => (firstName: parts[0], lastName: string.Empty),
            _ => (firstName: parts[0], lastName: parts[1]),
        };
    }

    // ============================================================================
    // Private Instance Helper Methods
    // ============================================================================

    private string GetRedirectUri(string callbackPath)
    {
        var baseUrl = _configuration["Application:BaseUrl"] ?? "https://localhost:5001";
        return $"{baseUrl.TrimEnd('/')}{callbackPath}";
    }

    private async Task<MicrosoftTokenResponse> ExchangeCodeForTokensAsync(string code, CancellationToken ct)
    {
        var clientId = _configuration["Authentication:Microsoft:ClientId"]!;
        var clientSecret = _configuration["Authentication:Microsoft:ClientSecret"]!;
        var callbackPath = _configuration["Authentication:Microsoft:CallbackPath"] ?? "/api/v1/auth/microsoft/callback";
        var redirectUri = GetRedirectUri(callbackPath);

        using var client = _httpClientFactory.CreateClient();
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["code"] = code,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code",
        });

        var response = await client.PostAsync(MicrosoftTokenUri, content, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<MicrosoftTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to parse Microsoft token response");
    }

    private async Task<MicrosoftUserInfo> GetMicrosoftUserInfoAsync(string accessToken, CancellationToken ct)
    {
        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync(MicrosoftUserInfoUri, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(ct);
        return JsonSerializer.Deserialize<MicrosoftUserInfo>(json)
            ?? throw new InvalidOperationException("Failed to parse Microsoft user info");
    }

    private async Task<(ApplicationUser user, bool isNew)> FindOrCreateUserAsync(
        MicrosoftUserInfo msUser,
        Guid? businessId,
        string? selectedPlan,
        CancellationToken ct)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.MicrosoftId == msUser.Id, ct);

        if (existingUser != null)
        {
            return (existingUser, false);
        }

        existingUser = await _userManager.FindByEmailAsync(msUser.Email ?? msUser.UserPrincipalName ?? string.Empty);
        if (existingUser != null)
        {
            existingUser.MicrosoftId = msUser.Id;
            existingUser.OAuthProvider = "Microsoft";
            await _userManager.UpdateAsync(existingUser);
            return (existingUser, false);
        }

        var userEmail = msUser.Email ?? msUser.UserPrincipalName ?? string.Empty;
        var business = businessId.HasValue
            ? await _context.Businesses.FindAsync([businessId.Value], ct)
            : await CreateDefaultBusinessAsync(userEmail, selectedPlan, ct);

        var nameParts = ParseDisplayName(msUser.DisplayName);
        var newUser = new ApplicationUser
        {
            UserName = msUser.Email ?? msUser.UserPrincipalName,
            Email = msUser.Email ?? msUser.UserPrincipalName,
            EmailConfirmed = true,
            FirstName = nameParts.firstName,
            LastName = nameParts.lastName,
            MicrosoftId = msUser.Id,
            OAuthProvider = "Microsoft",
            BusinessId = business?.Id ?? Guid.Empty,
        };

        var result = await _userManager.CreateAsync(newUser);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        await _userManager.AddToRoleAsync(newUser, ApplicationRole.Owner);
        return (newUser, true);
    }

    private async Task<Business> CreateDefaultBusinessAsync(string email, string? selectedPlan, CancellationToken ct)
    {
        // Extract domain from email for business name (same as Google OAuth)
        var domain = email.Split('@').LastOrDefault() ?? "unknown";
        var businessName = $"{domain} (OAuth)";

        var business = new Business
        {
            Id = Guid.NewGuid(),
            Name = businessName,
            Email = email, // Set business email for Stripe checkout
            CreatedAt = DateTime.UtcNow,
        };
        _context.Businesses.Add(business);
        await _context.SaveChangesAsync(ct);

        // Create trial subscription for the new business with selected plan
        await CreateTrialSubscriptionAsync(business.Id, selectedPlan, ct);

        // Initialize usage counters for the new business
        await _usageLimitService.EnsureUsageCountersExistAsync(business.Id, ct);

        return business;
    }

    private async Task CreateTrialSubscriptionAsync(Guid businessId, string? selectedPlan, CancellationToken cancellationToken)
    {
        // SECURITY: ALWAYS start with FreeFlow plan during OAuth registration, regardless of selected plan.
        // The selected plan is only activated AFTER Stripe webhook confirms successful payment.
        // This prevents users from accessing paid features before payment is complete.
        _logger.LogInformation(
            "OAuth CreateTrialSubscriptionAsync: Creating FreeFlow subscription for business {BusinessId}. Selected plan '{SelectedPlan}' will be activated after payment.",
            businessId,
            selectedPlan ?? "none");

        var plan = await _context.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Name == SubscriptionConstants.DefaultPlanName && p.IsActive, cancellationToken);

        if (plan == null)
        {
            _logger.LogWarning("FreeFlow plan not found for business {BusinessId}", businessId);
            throw new InvalidOperationException("FreeFlow plan not found. Please contact support.");
        }

        // Determine subscription status and trial dates based on plan settings
        var now = DateTime.UtcNow;
        var hasTrial = plan.AllowsTrial && plan.TrialDays > 0;
        var status = hasTrial ? Domain.Enums.SubscriptionStatus.Trial : Domain.Enums.SubscriptionStatus.Active;

        var subscription = new Subscription
        {
            BusinessId = businessId,
            PlanId = plan.Id,
            PlanVersion = plan.Version,
            Status = status,
            BillingCycle = SubscriptionConstants.BillingIntervalMonthly,
            Currency = SubscriptionConstants.DefaultCurrency,
            CurrentPeriodStart = now,
            CurrentPeriodEnd = hasTrial ? now.AddDays(plan.TrialDays) : now.AddMonths(1),
            TrialStart = hasTrial ? now : null,
            TrialEnd = hasTrial ? now.AddDays(plan.TrialDays) : null,
            MonthlyAmount = plan.PriceMonthly,
            CreatedAt = now,
        };

        await _context.Set<Subscription>().AddAsync(subscription, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created subscription for business {BusinessId} with plan {PlanName}, status {Status}",
            businessId, plan.DisplayName ?? plan.Name, status);
    }

    private sealed class MicrosoftOAuthStateData
    {
        public string? ReturnUrl { get; set; }

        public Guid? BusinessId { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    private sealed class MicrosoftTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }
    }

    private sealed class MicrosoftUserInfo
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }

        [JsonPropertyName("mail")]
        public string? Email { get; set; }

        [JsonPropertyName("userPrincipalName")]
        public string? UserPrincipalName { get; set; }
    }

    private sealed class MicrosoftIdTokenClaims
    {
        [JsonPropertyName("aud")]
        public string? Aud { get; set; }

        [JsonPropertyName("sub")]
        public string? Sub { get; set; }

        [JsonPropertyName("oid")]
        public string? Oid { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("preferred_username")]
        public string? PreferredUsername { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }
}

