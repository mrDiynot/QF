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
/// Implementation of Google OAuth service.
/// Handles OAuth flow, token exchange, and user account creation/linking.
/// </summary>
[SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via DI")]
public partial class GoogleOAuthService : IGoogleOAuthService
{
    private const string GoogleAuthEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string GoogleUserInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";
    private const string OAuthStateCachePrefix = "oauth_state_";

    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly QualiFlowDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<GoogleOAuthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GoogleOAuthService"/> class.
    /// </summary>
    /// <param name="configuration">The configuration.</param>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="userManager">The user manager.</param>
    /// <param name="jwtTokenService">The JWT token service.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    /// <param name="context">The database context.</param>
    /// <param name="cache">The memory cache.</param>
    /// <param name="logger">The logger.</param>
    public GoogleOAuthService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        UserManager<ApplicationUser> userManager,
        IJwtTokenService jwtTokenService,
        IUsageLimitService usageLimitService,
        QualiFlowDbContext context,
        IMemoryCache cache,
        ILogger<GoogleOAuthService> logger)
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
        var clientId = _configuration["Authentication:Google:ClientId"]
            ?? throw new InvalidOperationException("Google OAuth ClientId not configured");
        var callbackPath = _configuration["Authentication:Google:CallbackPath"] ?? "/api/v1/auth/google/callback";

        // Generate secure state for CSRF protection
        var state = GenerateSecureState();

        // Store state with metadata in cache (expires in 10 minutes)
        var stateData = new OAuthStateData
        {
            ReturnUrl = returnUrl,
            BusinessId = businessId,
            CreatedAt = DateTime.UtcNow,
        };
        _cache.Set($"{OAuthStateCachePrefix}{state}", stateData, TimeSpan.FromMinutes(10));

        // Build authorization URL
        var redirectUri = GetRedirectUri(callbackPath);
        var authUrl = BuildAuthorizationUrl(clientId, redirectUri, state);

        LogOAuthInitiated(_logger, returnUrl, businessId);

        return Task.FromResult(new OAuthInitiateResponse
        {
            AuthorizationUrl = authUrl,
            State = state,
            Provider = "Google",
        });
    }

    /// <inheritdoc />
    public async Task<OAuthLoginResponse> HandleCallbackAsync(
        string code,
        string state,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        // Validate state
        if (!await ValidateStateAsync(state, cancellationToken))
        {
            throw new InvalidOperationException("Invalid or expired OAuth state");
        }

        // Get state data
        var stateData = _cache.Get<OAuthStateData>($"{OAuthStateCachePrefix}{state}");
        _cache.Remove($"{OAuthStateCachePrefix}{state}"); // Remove used state

        // Exchange code for tokens
        var tokenResponse = await ExchangeCodeForTokensAsync(code, cancellationToken);

        // Get user info from Google
        var googleUser = await GetGoogleUserInfoAsync(tokenResponse.AccessToken, cancellationToken);

        // Find or create user (callback flow doesn't have selectedPlan, defaults to freeflow)
        var (user, isNewUser) = await FindOrCreateUserAsync(googleUser, stateData?.BusinessId, null, cancellationToken);

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
            Provider = "Google",
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
    public async Task<OAuthStatusResponse> GetOAuthStatusAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return new OAuthStatusResponse { HasGoogleLinked = false };
        }

        return new OAuthStatusResponse
        {
            HasGoogleLinked = !string.IsNullOrEmpty(user.GoogleId),
            GoogleEmail = string.Equals(user.OAuthProvider, "Google", StringComparison.Ordinal) ? user.Email : null,
            GoogleProfilePicture = user.ProfilePictureUrl,
            GoogleLinkedAt = string.Equals(user.OAuthProvider, "Google", StringComparison.Ordinal) ? user.CreatedAt : null,
        };
    }

    /// <inheritdoc />
    public async Task<OAuthLoginResponse> AuthenticateWithIdTokenAsync(
        string idToken,
        string? ipAddress,
        string? selectedPlan = null,
        CancellationToken cancellationToken = default)
    {
        // Validate ID token with Google and get user info
        var googleUser = await ValidateIdTokenAsync(idToken, cancellationToken);

        // Find or create user (pass selectedPlan for new user subscription creation)
        var (user, isNewUser) = await FindOrCreateUserAsync(googleUser, null, selectedPlan, cancellationToken);

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
            Provider = "Google",
            ProfilePictureUrl = user.ProfilePictureUrl,
        };
    }

    [SuppressMessage("Reliability", "CA2000:Dispose objects before losing scope", Justification = "HttpClient from factory is managed by the factory")]
    private async Task<GoogleUserInfo> ValidateIdTokenAsync(
        string idToken,
        CancellationToken cancellationToken)
    {
        // Validate ID token with Google's tokeninfo endpoint
        using var client = _httpClientFactory.CreateClient();
        var tokenInfoUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";

        using var response = await client.GetAsync(new Uri(tokenInfoUrl), cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("Invalid Google ID token");
        }

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        var tokenInfo = JsonSerializer.Deserialize<GoogleIdTokenInfo>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Google token info");

        // Validate audience (client ID)
        var clientId = _configuration["Authentication:Google:ClientId"];
        if (!string.Equals(tokenInfo.Aud, clientId, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("ID token was not issued for this application");
        }

        // Convert to GoogleUserInfo format
        return new GoogleUserInfo
        {
            Id = tokenInfo.Sub,
            Email = tokenInfo.Email,
            VerifiedEmail = tokenInfo.EmailVerified,
            Name = tokenInfo.Name,
            GivenName = tokenInfo.GivenName,
            FamilyName = tokenInfo.FamilyName,
            Picture = tokenInfo.Picture,
        };
    }

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

    [SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "Google OAuth endpoints are stable")]
    private static string BuildAuthorizationUrl(string clientId, string redirectUri, string state)
    {
        var scopes = "openid email profile";
        return $"{GoogleAuthEndpoint}?" +
               $"client_id={Uri.EscapeDataString(clientId)}&" +
               $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
               $"response_type=code&" +
               $"scope={Uri.EscapeDataString(scopes)}&" +
               $"state={Uri.EscapeDataString(state)}&" +
               $"access_type=offline&" +
               $"prompt=consent";
    }

    // ============================================================================
    // LoggerMessage Definitions (Static)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "OAuth initiated. ReturnUrl={ReturnUrl}, BusinessId={BusinessId}")]
    private static partial void LogOAuthInitiated(ILogger logger, string? returnUrl, Guid? businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "OAuth success. UserId={UserId}, Email={Email}, IsNewUser={IsNewUser}")]
    private static partial void LogOAuthSuccess(ILogger logger, Guid userId, string email, bool isNewUser);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Existing user found via Google ID. UserId={UserId}, Email={Email}")]
    private static partial void LogExistingUserFound(ILogger logger, Guid userId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "Google account linked to existing user. UserId={UserId}, Email={Email}")]
    private static partial void LogAccountLinked(ILogger logger, Guid userId, string email);

    [LoggerMessage(Level = LogLevel.Information, Message = "New OAuth user created. UserId={UserId}, Email={Email}")]
    private static partial void LogNewUserCreated(ILogger logger, Guid userId, string email);

    // ============================================================================
    // Private Instance Helper Methods
    // ============================================================================

    [SuppressMessage("Design", "S1075:URIs should not be hardcoded", Justification = "Default localhost for development")]
    private string GetRedirectUri(string callbackPath)
    {
        var baseUrl = _configuration["Authentication:Google:RedirectBaseUrl"]
            ?? "https://localhost:7001";
        return $"{baseUrl}{callbackPath}";
    }

    [SuppressMessage("Reliability", "CA2000:Dispose objects before losing scope", Justification = "HttpClient from factory is managed by the factory")]
    private async Task<GoogleTokenResponse> ExchangeCodeForTokensAsync(
        string code,
        CancellationToken cancellationToken)
    {
        var clientId = _configuration["Authentication:Google:ClientId"]!;
        var clientSecret = _configuration["Authentication:Google:ClientSecret"]!;
        var callbackPath = _configuration["Authentication:Google:CallbackPath"] ?? "/api/v1/auth/google/callback";
        var redirectUri = GetRedirectUri(callbackPath);

        using var client = _httpClientFactory.CreateClient();
        using var content = new FormUrlEncodedContent(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["code"] = code,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["redirect_uri"] = redirectUri,
            ["grant_type"] = "authorization_code",
        });

        using var response = await client.PostAsync(new Uri(GoogleTokenEndpoint), content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<GoogleTokenResponse>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Google token response");
    }

    [SuppressMessage("Reliability", "CA2000:Dispose objects before losing scope", Justification = "HttpClient from factory is managed by the factory")]
    private async Task<GoogleUserInfo> GetGoogleUserInfoAsync(
        string accessToken,
        CancellationToken cancellationToken)
    {
        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await client.GetAsync(new Uri(GoogleUserInfoEndpoint), cancellationToken);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        return JsonSerializer.Deserialize<GoogleUserInfo>(json)
            ?? throw new InvalidOperationException("Failed to deserialize Google user info");
    }

    private async Task<(ApplicationUser user, bool isNew)> FindOrCreateUserAsync(
        GoogleUserInfo googleUser,
        Guid? businessId,
        string? selectedPlan,
        CancellationToken cancellationToken)
    {
        // First, try to find by Google ID
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.GoogleId == googleUser.Id, cancellationToken);

        if (existingUser != null)
        {
            LogExistingUserFound(_logger, existingUser.Id, existingUser.Email ?? string.Empty);
            return (existingUser, false);
        }

        // Then, try to find by email
        existingUser = await _userManager.FindByEmailAsync(googleUser.Email);
        if (existingUser != null)
        {
            // Link Google account to existing user
            existingUser.GoogleId = googleUser.Id;
            existingUser.ProfilePictureUrl = googleUser.Picture;
            existingUser.EmailVerifiedViaOAuth = googleUser.VerifiedEmail;
            existingUser.UpdatedAt = DateTime.UtcNow;

            await _userManager.UpdateAsync(existingUser);
            LogAccountLinked(_logger, existingUser.Id, existingUser.Email ?? string.Empty);
            return (existingUser, false);
        }

        // Create new user (pass selectedPlan for subscription creation)
        var newUser = await CreateNewOAuthUserAsync(googleUser, businessId, selectedPlan, cancellationToken);
        return (newUser, true);
    }

    private async Task<ApplicationUser> CreateNewOAuthUserAsync(
        GoogleUserInfo googleUser,
        Guid? businessId,
        string? selectedPlan,
        CancellationToken cancellationToken)
    {
        // Create a default business for the user if not provided (pass selectedPlan for subscription)
        var effectiveBusinessId = businessId ?? await CreateDefaultBusinessAsync(googleUser.Email, selectedPlan, cancellationToken);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = googleUser.Email,
            Email = googleUser.Email,
            EmailConfirmed = googleUser.VerifiedEmail,
            FirstName = googleUser.GivenName ?? string.Empty,
            LastName = googleUser.FamilyName ?? string.Empty,
            GoogleId = googleUser.Id,
            ProfilePictureUrl = googleUser.Picture,
            EmailVerifiedViaOAuth = googleUser.VerifiedEmail,
            OAuthProvider = "Google",
            BusinessId = effectiveBusinessId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user: {errors}");
        }

        // Assign Owner role to the new user (they are the business owner)
        await _userManager.AddToRoleAsync(user, ApplicationRole.Owner);

        LogNewUserCreated(_logger, user.Id, user.Email ?? string.Empty);
        return user;
    }

    private async Task<Guid> CreateDefaultBusinessAsync(string email, string? selectedPlan, CancellationToken cancellationToken)
    {
        // Extract domain from email for business name
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
        await _context.SaveChangesAsync(cancellationToken);

        // Create trial subscription for the new business with selected plan
        await CreateTrialSubscriptionAsync(business.Id, selectedPlan, cancellationToken);

        // Initialize usage counters for the new business
        await _usageLimitService.EnsureUsageCountersExistAsync(business.Id, cancellationToken);

        return business.Id;
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
            LogPlanNotFound(_logger, SubscriptionConstants.DefaultPlanName, businessId);
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

        LogSubscriptionCreated(_logger, businessId, plan.DisplayName ?? plan.Name, status.ToString());
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Plan '{PlanName}' not found for business {BusinessId}")]
    private static partial void LogPlanNotFound(ILogger logger, string planName, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Created subscription for business {BusinessId} with plan {PlanName}, status {Status}")]
    private static partial void LogSubscriptionCreated(ILogger logger, Guid businessId, string planName, string status);

    // ============================================================================
    // Nested Supporting Types
    // ============================================================================

    /// <summary>
    /// Internal state data stored in cache during OAuth flow.
    /// </summary>
    private sealed record OAuthStateData
    {
        /// <summary>
        /// Gets the return URL after authentication.
        /// </summary>
        public string? ReturnUrl { get; init; }

        /// <summary>
        /// Gets the business ID for account linking.
        /// </summary>
        public Guid? BusinessId { get; init; }

        /// <summary>
        /// Gets the creation timestamp.
        /// </summary>
        public DateTime CreatedAt { get; init; }
    }

    /// <summary>
    /// Google token response from OAuth token exchange.
    /// </summary>
    [SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via JSON deserialization")]
    private sealed record GoogleTokenResponse
    {
        /// <summary>
        /// Gets the access token.
        /// </summary>
        [JsonPropertyName("access_token")]
        public string AccessToken { get; init; } = string.Empty;

        /// <summary>
        /// Gets the refresh token.
        /// </summary>
        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; init; }

        /// <summary>
        /// Gets the token expiration in seconds.
        /// </summary>
        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; init; }

        /// <summary>
        /// Gets the token type.
        /// </summary>
        [JsonPropertyName("token_type")]
        public string TokenType { get; init; } = string.Empty;

        /// <summary>
        /// Gets the ID token.
        /// </summary>
        [JsonPropertyName("id_token")]
        public string? IdToken { get; init; }
    }

    /// <summary>
    /// Google ID token info response from tokeninfo endpoint.
    /// </summary>
    [SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via JSON deserialization")]
    private sealed record GoogleIdTokenInfo
    {
        /// <summary>
        /// Gets the subject (Google user ID).
        /// </summary>
        [JsonPropertyName("sub")]
        public string Sub { get; init; } = string.Empty;

        /// <summary>
        /// Gets the user's email address.
        /// </summary>
        [JsonPropertyName("email")]
        public string Email { get; init; } = string.Empty;

        /// <summary>
        /// Gets a value indicating whether the email is verified.
        /// Google tokeninfo returns this as a string "true"/"false", not a boolean.
        /// </summary>
        [JsonPropertyName("email_verified")]
        [JsonConverter(typeof(BooleanStringConverter))]
        public bool EmailVerified { get; init; }

        /// <summary>
        /// Gets the user's full name.
        /// </summary>
        [JsonPropertyName("name")]
        public string? Name { get; init; }

        /// <summary>
        /// Gets the user's given name.
        /// </summary>
        [JsonPropertyName("given_name")]
        public string? GivenName { get; init; }

        /// <summary>
        /// Gets the user's family name.
        /// </summary>
        [JsonPropertyName("family_name")]
        public string? FamilyName { get; init; }

        /// <summary>
        /// Gets the user's profile picture URL.
        /// </summary>
        [JsonPropertyName("picture")]
        public string? Picture { get; init; }

        /// <summary>
        /// Gets the audience (client ID).
        /// </summary>
        [JsonPropertyName("aud")]
        public string Aud { get; init; } = string.Empty;
    }

    /// <summary>
    /// Google user info response.
    /// </summary>
    [SuppressMessage("Design", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated via JSON deserialization")]
    private sealed record GoogleUserInfo
    {
        /// <summary>
        /// Gets the Google user ID.
        /// </summary>
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        /// <summary>
        /// Gets the user's email address.
        /// </summary>
        [JsonPropertyName("email")]
        public string Email { get; init; } = string.Empty;

        /// <summary>
        /// Gets a value indicating whether the email is verified.
        /// </summary>
        [JsonPropertyName("verified_email")]
        public bool VerifiedEmail { get; init; }

        /// <summary>
        /// Gets the user's full name.
        /// </summary>
        [JsonPropertyName("name")]
        public string? Name { get; init; }

        /// <summary>
        /// Gets the user's given name.
        /// </summary>
        [JsonPropertyName("given_name")]
        public string? GivenName { get; init; }

        /// <summary>
        /// Gets the user's family name.
        /// </summary>
        [JsonPropertyName("family_name")]
        public string? FamilyName { get; init; }

        /// <summary>
        /// Gets the user's profile picture URL.
        /// </summary>
        [JsonPropertyName("picture")]
        public string? Picture { get; init; }
    }

    /// <summary>
    /// JSON converter that handles boolean values represented as strings ("true"/"false").
    /// Google's tokeninfo endpoint returns email_verified as a string, not a boolean.
    /// </summary>
    private sealed class BooleanStringConverter : JsonConverter<bool>
    {
        public override bool Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.True => true,
                JsonTokenType.False => false,
                JsonTokenType.String => bool.TryParse(reader.GetString(), out var result) && result,
                _ => false,
            };
        }

        public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
        {
            writer.WriteBooleanValue(value);
        }
    }
}
