using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Admin.Auth;
using QualiFlow.Application.Features.AuditLogs.Services;
using QualiFlow.Application.Features.Auth.DTOs;
using QualiFlow.Application.Features.Auth.Services;
using QualiFlow.Application.Features.Auth.Validators;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for authentication operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public partial class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IGoogleOAuthService _googleOAuthService;
    private readonly IMicrosoftOAuthService _microsoftOAuthService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IAuthenticationAuditService _authAuditService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly QualiFlowDbContext _dbContext;
    private readonly LoginRequestValidator _loginValidator;
    private readonly RefreshTokenRequestValidator _refreshTokenValidator;
    private readonly LogoutRequestValidator _logoutValidator;
    private readonly RegisterRequestValidator _registerValidator;
    private readonly ILogger<AuthController> _logger;
    private readonly ITwoFactorAuthService _twoFactorAuthService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly IEmailOtpService _emailOtpService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AuthController"/> class.
    /// </summary>
    /// <param name="userManager">The user manager.</param>
    /// <param name="signInManager">The sign-in manager.</param>
    /// <param name="jwtTokenService">The JWT token service.</param>
    /// <param name="googleOAuthService">The Google OAuth service.</param>
    /// <param name="microsoftOAuthService">The Microsoft OAuth service.</param>
    /// <param name="emailVerificationService">The email verification service.</param>
    /// <param name="authAuditService">The authentication audit service.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    /// <param name="dbContext">The database context.</param>
    /// <param name="loginValidator">The login request validator.</param>
    /// <param name="refreshTokenValidator">The refresh token request validator.</param>
    /// <param name="logoutValidator">The logout request validator.</param>
    /// <param name="registerValidator">The register request validator.</param>
    /// <param name="logger">The logger.</param>
    /// <param name="twoFactorAuthService">The two-factor authentication service.</param>
    /// <param name="emailService">The email service for sending password reset emails.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="emailOtpService">The email OTP service for email-based authentication.</param>
    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenService jwtTokenService,
        IGoogleOAuthService googleOAuthService,
        IMicrosoftOAuthService microsoftOAuthService,
        IEmailVerificationService emailVerificationService,
        IAuthenticationAuditService authAuditService,
        IUsageLimitService usageLimitService,
        QualiFlowDbContext dbContext,
        LoginRequestValidator loginValidator,
        RefreshTokenRequestValidator refreshTokenValidator,
        LogoutRequestValidator logoutValidator,
        RegisterRequestValidator registerValidator,
        ILogger<AuthController> logger,
        ITwoFactorAuthService twoFactorAuthService,
        IEmailService emailService,
        IConfiguration configuration,
        IEmailOtpService emailOtpService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _googleOAuthService = googleOAuthService;
        _microsoftOAuthService = microsoftOAuthService;
        _emailVerificationService = emailVerificationService;
        _authAuditService = authAuditService;
        _usageLimitService = usageLimitService;
        _dbContext = dbContext;
        _loginValidator = loginValidator;
        _refreshTokenValidator = refreshTokenValidator;
        _logoutValidator = logoutValidator;
        _registerValidator = registerValidator;
        _logger = logger;
        _twoFactorAuthService = twoFactorAuthService;
        _emailService = emailService;
        _configuration = configuration;
        _emailOtpService = emailOtpService;
    }

    /// <summary>
    /// Authenticates a user and returns JWT tokens.
    /// When RememberMe is false, requires email OTP verification before issuing tokens.
    /// </summary>
    /// <param name="request">The login request containing email, password, and rememberMe flag.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with access token and refresh token, or OTP required response.</returns>
    /// <response code="200">Login successful. Returns access token and refresh token.</response>
    /// <response code="202">OTP verification required. Returns OTP required response.</response>
    /// <response code="400">Invalid request data (validation failed).</response>
    /// <response code="401">Invalid credentials or account locked/inactive.</response>
    /// <response code="429">Too many OTP requests. Rate limit exceeded.</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [NoCache]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(LoginOtpRequiredResponse), StatusCodes.Status202Accepted)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> LoginAsync(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        // Validate request
        var validationResult = await _loginValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            LogLoginValidationFailed(_logger, request.Email);
            await _authAuditService.LogLoginFailedAsync(
                request.Email,
                "Validation failed",
                ipAddress,
                userAgent,
                cancellationToken);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)),
            });
        }

        // Find and validate user
        var user = await _userManager.FindByEmailAsync(request.Email);
        var userValidationResult = await ValidateUserAsync(user, request.Email, ipAddress, userAgent, cancellationToken);
        if (userValidationResult != null)
        {
            return userValidationResult;
        }

        // Authenticate user
        var authResult = await AuthenticateUserAsync(user!, request.Password, request.Email, ipAddress, userAgent, cancellationToken);
        if (authResult != null)
        {
            return authResult;
        }

        // If RememberMe is true, skip OTP and issue tokens directly
        if (request.RememberMe)
        {
            var loginResponse = await GenerateLoginResponseAsync(user!, cancellationToken);
            return loginResponse.Result ?? Ok(loginResponse.Value);
        }

        // RememberMe is false - require email OTP verification
        // Check rate limiting for OTP requests
        if (!await _emailOtpService.CanRequestOtpAsync(user!.Id, cancellationToken))
        {
            _logger.LogWarning("OTP rate limit exceeded for user {UserId}", user.Id);
            return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Too many requests",
                Detail = "You have exceeded the maximum number of OTP requests. Please try again later.",
            });
        }

        // Generate and send OTP
        var otpSent = await _emailOtpService.GenerateAndSendOtpAsync(
            user.Id,
            user.Email!,
            user.FirstName ?? "User",
            ipAddress,
            cancellationToken);

        if (!otpSent)
        {
            _logger.LogError("Failed to send OTP email to user {UserId}", user.Id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Email delivery failed",
                Detail = "Failed to send verification code. Please try again.",
            });
        }

        // Return OTP required response
        var resendCooldown = await _emailOtpService.GetResendCooldownSecondsAsync(user.Id, cancellationToken);
        return StatusCode(StatusCodes.Status202Accepted, new LoginOtpRequiredResponse
        {
            RequiresEmailOtp = true,
            MaskedEmail = MaskEmail(user.Email!),
            ResendCooldownSeconds = resendCooldown,
            OtpExpirationSeconds = 300,
            Message = "A verification code has been sent to your email.",
        });
    }

    /// <summary>
    /// Masks an email address for display (e.g., j***@example.com).
    /// </summary>
    private static string MaskEmail(string email)
    {
        var atIndex = email.IndexOf('@', StringComparison.Ordinal);
        if (atIndex <= 1)
        {
            return email;
        }

        var localPart = email[..atIndex];
        var domain = email[atIndex..];
        var maskedLocal = localPart[0] + new string('*', Math.Min(localPart.Length - 1, 5));
        return maskedLocal + domain;
    }

    /// <summary>
    /// Verifies an email OTP code and issues JWT tokens upon successful verification.
    /// </summary>
    /// <param name="request">The OTP verification request containing email and OTP code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with access token and refresh token.</returns>
    /// <response code="200">OTP verification successful. Returns access token and refresh token.</response>
    /// <response code="400">Invalid request data (validation failed).</response>
    /// <response code="401">Invalid or expired OTP code.</response>
    /// <response code="429">Too many verification attempts.</response>
    [HttpPost("verify-email-otp")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LoginResponse>> VerifyEmailOtpAsync(
        [FromBody] VerifyEmailOtpRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();

        // Find user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("OTP verification attempted for non-existent email: {Email}", request.Email);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Verification failed",
                Detail = "Invalid or expired verification code.",
            });
        }

        // Check if user can attempt verification (rate limiting)
        if (!await _emailOtpService.CanAttemptVerificationAsync(user.Id, cancellationToken))
        {
            _logger.LogWarning("OTP verification rate limit exceeded for user {UserId}", user.Id);
            return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Too many attempts",
                Detail = "You have exceeded the maximum number of verification attempts. Please request a new code.",
            });
        }

        // Verify OTP
        var verifiedUserId = await _emailOtpService.VerifyOtpAsync(request.Email, request.OtpCode, cancellationToken);
        if (verifiedUserId == null)
        {
            await _authAuditService.LogLoginFailedAsync(
                request.Email,
                "Invalid OTP code",
                ipAddress,
                userAgent,
                cancellationToken);

            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Verification failed",
                Detail = "Invalid or expired verification code.",
            });
        }

        // OTP verified successfully - generate and return tokens
        _logger.LogInformation("OTP verified successfully for user {UserId}", user.Id);
        return await GenerateLoginResponseAsync(user, cancellationToken);
    }

    /// <summary>
    /// Resends an email OTP code to the user.
    /// </summary>
    /// <param name="request">The resend OTP request containing the user's email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Resend OTP response with cooldown information.</returns>
    /// <response code="200">OTP resent successfully.</response>
    /// <response code="400">Invalid request data (validation failed).</response>
    /// <response code="429">Too many OTP requests. Rate limit exceeded.</response>
    [HttpPost("resend-email-otp")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ResendEmailOtpResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ResendEmailOtpResponse>> ResendEmailOtpAsync(
        [FromBody] ResendEmailOtpRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Find user by email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Return success even if user doesn't exist (security - don't reveal user existence)
            return Ok(new ResendEmailOtpResponse
            {
                Success = true,
                ResendCooldownSeconds = 60,
                Message = "If an account exists with this email, a verification code has been sent.",
            });
        }

        // Check cooldown
        var cooldownSeconds = await _emailOtpService.GetResendCooldownSecondsAsync(user.Id, cancellationToken);
        if (cooldownSeconds > 0)
        {
            return Ok(new ResendEmailOtpResponse
            {
                Success = false,
                ResendCooldownSeconds = cooldownSeconds,
                Message = $"Please wait {cooldownSeconds} seconds before requesting a new code.",
            });
        }

        // Check rate limiting for OTP requests
        if (!await _emailOtpService.CanRequestOtpAsync(user.Id, cancellationToken))
        {
            _logger.LogWarning("OTP rate limit exceeded for user {UserId}", user.Id);
            return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Too many requests",
                Detail = "You have exceeded the maximum number of OTP requests. Please try again later.",
            });
        }

        // Generate and send OTP
        var otpSent = await _emailOtpService.GenerateAndSendOtpAsync(
            user.Id,
            user.Email!,
            user.FirstName ?? "User",
            ipAddress,
            cancellationToken);

        var newCooldown = await _emailOtpService.GetResendCooldownSecondsAsync(user.Id, cancellationToken);

        return Ok(new ResendEmailOtpResponse
        {
            Success = otpSent,
            ResendCooldownSeconds = newCooldown,
            Message = otpSent
                ? "A new verification code has been sent to your email."
                : "Failed to send verification code. Please try again.",
        });
    }

    /// <summary>
    /// Refreshes an access token using a refresh token.
    /// Implements token rotation for security (old token is revoked, new tokens issued).
    /// </summary>
    /// <param name="request">The refresh token request containing the refresh token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with new access token and refresh token.</returns>
    /// <response code="200">Token refresh successful. Returns new access token and refresh token.</response>
    /// <response code="400">Invalid request data (validation failed).</response>
    /// <response code="401">Invalid, expired, or revoked refresh token.</response>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [NoCache]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> RefreshTokenAsync(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        // Validate request
        var validationResult = await _refreshTokenValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            LogRefreshTokenValidationFailed(_logger, request.RefreshToken);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)),
            });
        }

        // Validate refresh token
        var refreshToken = await _jwtTokenService.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken);
        if (refreshToken == null)
        {
            LogInvalidRefreshToken(_logger, request.RefreshToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Invalid or expired refresh token.",
            });
        }

        // Get user
        var user = await _userManager.FindByIdAsync(refreshToken.UserId.ToString());
        if (user == null)
        {
            LogRefreshTokenUserNotFound(_logger, refreshToken.UserId);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Invalid or expired refresh token.",
            });
        }

        // Check if user is active and not deleted
        var userValidationResult = ValidateUserForRefresh(user);
        if (userValidationResult != null)
        {
            return userValidationResult;
        }

        // Revoke old refresh token and generate new tokens
        return await RotateRefreshTokenAsync(user, request.RefreshToken, cancellationToken);
    }

    /// <summary>
    /// Logs out a user by revoking their refresh token.
    /// After logout, the refresh token cannot be used to obtain new access tokens.
    /// </summary>
    /// <param name="request">The logout request containing the refresh token to revoke.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on successful logout.</returns>
    /// <response code="204">Logout successful. Refresh token has been revoked.</response>
    /// <response code="400">Invalid request data (validation failed).</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("logout")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [NoCache]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LogoutAsync(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        // Validate request
        var validationResult = await _logoutValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            LogLogoutValidationFailed(_logger, request.RefreshToken);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)),
            });
        }

        // Get current user ID from claims
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            LogLogoutUnauthorized(_logger);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "User is not authenticated.",
            });
        }

        // Revoke refresh token
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _jwtTokenService.RevokeRefreshTokenAsync(request.RefreshToken, ipAddress, cancellationToken);

        var userGuid = Guid.Parse(userId);
        LogSuccessfulLogout(_logger, userGuid, ipAddress ?? "unknown");

        // Log logout to audit trail
        await _authAuditService.LogLogoutAsync(userGuid, ipAddress, cancellationToken);

        // Return 204 No Content on success (even if token was already revoked)
        return NoContent();
    }

    // ============================================================================
    // REGISTRATION ENDPOINT
    // ============================================================================

    /// <summary>
    /// Checks if a business name is available for registration.
    /// </summary>
    /// <param name="name">The business name to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Availability status of the business name.</returns>
    /// <response code="200">Returns availability status.</response>
    [HttpGet("check-business-name")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckBusinessNameAsync(
        [FromQuery] string name,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Ok(new { available = false, error = "Business name is required" });
        }

        // Using ToUpperInvariant() instead of ILike() for InMemory database provider compatibility in tests
        // Suppressing CA1862 because EF Core can translate ToUpperInvariant() comparisons but not string.Equals with StringComparison
        var nameUpper = name.ToUpperInvariant();
#pragma warning disable CA1862 // EF Core requires direct string comparison for SQL translation
        var exists = await _dbContext.Businesses
            .AsNoTracking()
            .AnyAsync(b => b.Name.ToUpperInvariant() == nameUpper && b.DeletedAt == null, cancellationToken);
#pragma warning restore CA1862

        return Ok(new { available = !exists });
    }

    /// <summary>
    /// Registers a new user with a new business (tenant).
    /// Creates a new business and assigns the user as the Owner.
    /// </summary>
    /// <param name="request">The registration request containing user and business details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Registration response with access token and refresh token.</returns>
    /// <response code="201">Registration successful. Returns access token, refresh token, and user/business info.</response>
    /// <response code="400">Invalid request data (validation failed) or email already exists.</response>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RegisterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RegisterResponse>> RegisterAsync(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        // Validate request
        var validationResult = await _registerValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            LogRegistrationValidationFailed(_logger, request.Email);
            return CreateValidationProblem(validationResult);
        }

        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            LogRegistrationEmailExists(_logger, request.Email);
            return CreateEmailExistsProblem();
        }

        // Check if business name already exists (case-insensitive)
        // Using client-side evaluation for case-insensitive comparison
        // This approach works with both PostgreSQL and in-memory database (for tests)
        var existingBusinessNames = await _dbContext.Businesses
            .AsNoTracking()
            .Where(b => b.DeletedAt == null)
            .Select(b => b.Name)
            .ToListAsync(cancellationToken);

        var businessNameExists = existingBusinessNames
            .Exists(name => string.Equals(name, request.BusinessName, StringComparison.OrdinalIgnoreCase));
        if (businessNameExists)
        {
            LogRegistrationBusinessNameExists(_logger, request.BusinessName);
            return CreateBusinessNameExistsProblem();
        }

        // Create business and user
        var (business, user, createResult) = await CreateBusinessAndUserAsync(request, cancellationToken);
        if (!createResult.Succeeded)
        {
            return await HandleUserCreationFailureAsync(business, request.Email, createResult, cancellationToken);
        }

        // Assign Owner role
        await _userManager.AddToRoleAsync(user, ApplicationRole.Owner);

        // Send verification email (await to prevent DbContext disposal issues)
        try
        {
            await _emailVerificationService.SendVerificationEmailAsync(
                user.Id,
                user.Email ?? request.Email,
                user.FirstName,
                cancellationToken);
        }
        catch (Exception ex)
        {
            // Log but don't fail registration if email fails
            _logger.LogError(ex, "Failed to send verification email for user {UserId}", user.Id);
        }

        return await GenerateRegistrationResponseAsync(user, business, cancellationToken);
    }

    // ============================================================================
    // EMAIL VERIFICATION ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Verifies a user's email address using the provided token.
    /// BEST PRACTICE: Does NOT auto-login user. User must explicitly login after verification.
    /// </summary>
    /// <param name="request">The verification request containing user ID and token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Verification result.</returns>
    /// <response code="200">Email verified successfully. User should now login.</response>
    /// <response code="400">Invalid or expired verification token.</response>
    [HttpPost("verify-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EmailVerificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailVerificationResponse>> VerifyEmailAsync(
        [FromBody] VerifyEmailRequest request,
        CancellationToken cancellationToken)
    {
        LogEmailVerificationAttempt(_logger, request.UserId);

        var success = await _emailVerificationService.VerifyEmailAsync(
            request.UserId,
            request.Token,
            cancellationToken);

        if (!success)
        {
            return BadRequest(new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
                Title = "Email Verification Failed",
                Status = StatusCodes.Status400BadRequest,
                Detail = "The verification link is invalid or has expired. Please request a new verification email.",
                Instance = HttpContext.Request.Path,
            });
        }

        // BEST PRACTICE: Don't auto-login after verification
        // User should explicitly login to start a secure session
        return Ok(new EmailVerificationResponse
        {
            Success = true,
            Message = "Email verified successfully! Please log in to complete your onboarding and access your dashboard.",
        });
    }

    /// <summary>
    /// Resends the verification email to the user.
    /// </summary>
    /// <param name="request">The resend request containing the user's email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Resend result.</returns>
    /// <response code="200">Verification email sent (or already verified).</response>
    [HttpPost("resend-verification")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EmailVerificationResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<EmailVerificationResponse>> ResendVerificationEmailAsync(
        [FromBody] ResendVerificationEmailRequest request,
        CancellationToken cancellationToken)
    {
        LogResendVerificationAttempt(_logger, request.Email);

        // Always return success to prevent email enumeration attacks
        await _emailVerificationService.ResendVerificationEmailAsync(request.Email, cancellationToken);

        return Ok(new EmailVerificationResponse
        {
            Success = true,
            Message = "If an account exists with this email and is not yet verified, a verification email has been sent.",
            Email = request.Email,
        });
    }

    /// <summary>
    /// Checks the email verification status for the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The verification status.</returns>
    /// <response code="200">Returns the verification status.</response>
    /// <response code="401">User not authenticated.</response>
    [HttpGet("verification-status")]
    [Authorize]
    [ProducesResponseType(typeof(EmailVerificationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<EmailVerificationResponse>> GetVerificationStatusAsync(
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new EmailVerificationResponse
        {
            Success = user.EmailConfirmed,
            Message = user.EmailConfirmed
                ? "Email is verified."
                : "Email is not verified. Please check your inbox for the verification email.",
            Email = user.Email,
        });
    }

    // ============================================================================
    // GOOGLE OAUTH ENDPOINTS (S3-BE-013 to S3-BE-015)
    // ============================================================================

    /// <summary>
    /// Initiates Google OAuth authentication flow.
    /// Returns the Google authorization URL for the user to authenticate.
    /// </summary>
    /// <param name="request">The OAuth initiation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth initiation response with authorization URL.</returns>
    /// <response code="200">OAuth initiation successful. Returns authorization URL.</response>
    [HttpPost("google/initiate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OAuthInitiateResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OAuthInitiateResponse>> InitiateGoogleOAuthAsync(
        [FromBody] GoogleOAuthRequest request,
        CancellationToken cancellationToken)
    {
        LogGoogleOAuthInitiated(_logger, request.ReturnUrl);

        var response = await _googleOAuthService.InitiateOAuthAsync(
            request.ReturnUrl,
            request.BusinessId,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Handles the Google OAuth callback.
    /// Exchanges the authorization code for tokens and creates/links user account.
    /// </summary>
    /// <param name="request">The OAuth callback request with authorization code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth login response with JWT tokens.</returns>
    /// <response code="200">OAuth authentication successful. Returns JWT tokens.</response>
    /// <response code="400">OAuth error or invalid state.</response>
    [HttpPost("google/callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OAuthLoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OAuthLoginResponse>> HandleGoogleCallbackAsync(
        [FromBody] GoogleOAuthCallbackRequest request,
        CancellationToken cancellationToken)
    {
        // Check for OAuth errors from Google
        if (!string.IsNullOrEmpty(request.Error))
        {
            LogGoogleOAuthError(_logger, request.Error, request.ErrorDescription);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = request.ErrorDescription ?? request.Error,
            });
        }

        // Validate state
        if (string.IsNullOrEmpty(request.State) || !await _googleOAuthService.ValidateStateAsync(request.State, cancellationToken))
        {
            LogGoogleOAuthInvalidState(_logger);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid State",
                Detail = "The OAuth state parameter is invalid or expired.",
            });
        }

        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var response = await _googleOAuthService.HandleCallbackAsync(
                request.Code,
                request.State,
                ipAddress,
                cancellationToken);

            LogGoogleOAuthSuccess(_logger, response.UserId, response.Email, response.IsNewUser);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            LogGoogleOAuthFailed(_logger, ex.Message);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Failed",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Gets the OAuth status for the current user.
    /// Returns information about linked OAuth providers.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth status response.</returns>
    /// <response code="200">Returns OAuth status for the user.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("oauth/status")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(OAuthStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<OAuthStatusResponse>> GetOAuthStatusAsync(
        CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var status = await _googleOAuthService.GetOAuthStatusAsync(userId, cancellationToken);
        return Ok(status);
    }

    /// <summary>
    /// Authenticates a user using a Google ID token from NextAuth.js.
    /// This endpoint is used by frontend OAuth flows that receive ID tokens directly.
    /// </summary>
    /// <param name="request">The ID token request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The login response with JWT tokens.</returns>
    /// <response code="200">Authentication successful. Returns JWT tokens.</response>
    /// <response code="400">Invalid ID token or authentication failed.</response>
    [HttpPost("google/token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> AuthenticateWithGoogleIdTokenAsync(
        [FromBody] GoogleIdTokenRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var oauthResponse = await _googleOAuthService.AuthenticateWithIdTokenAsync(
                request.IdToken,
                ipAddress,
                request.SelectedPlan,
                cancellationToken);

            // Convert OAuthLoginResponse to LoginResponse format for NextAuth compatibility
            var user = await _userManager.FindByIdAsync(oauthResponse.UserId.ToString());
            if (user == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "User Not Found",
                    Detail = "Failed to retrieve user after OAuth authentication.",
                });
            }

            LogGoogleOAuthSuccess(_logger, oauthResponse.UserId, oauthResponse.Email, oauthResponse.IsNewUser);

            // Get user's actual role from database
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.FirstOrDefault() ?? ApplicationRole.Owner; // Default to Owner for OAuth users

            return Ok(new LoginResponse
            {
                AccessToken = oauthResponse.AccessToken,
                RefreshToken = oauthResponse.RefreshToken,
                ExpiresAt = oauthResponse.ExpiresAt,
                TokenType = oauthResponse.TokenType,
                IsNewUser = oauthResponse.IsNewUser,
                User = new UserDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    BusinessId = user.BusinessId.ToString(),
                    Role = userRole,
                    EmailConfirmed = user.EmailConfirmed,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt.ToString("O"),
                },
            });
        }
        catch (InvalidOperationException ex)
        {
            LogGoogleOAuthFailed(_logger, ex.Message);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Authentication Failed",
                Detail = ex.Message,
            });
        }
    }

    // ============================================================================
    // MICROSOFT OAUTH ENDPOINTS (S4-BE-028 to S4-BE-030)
    // ============================================================================

    /// <summary>
    /// Authenticates a user using a Microsoft ID token from NextAuth.js.
    /// This endpoint is used by frontend OAuth flows that receive ID tokens directly.
    /// </summary>
    /// <param name="request">The ID token request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The login response with JWT tokens.</returns>
    /// <response code="200">Authentication successful. Returns JWT tokens.</response>
    /// <response code="400">Invalid ID token or authentication failed.</response>
    [HttpPost("microsoft/token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoginResponse>> AuthenticateWithMicrosoftIdTokenAsync(
        [FromBody] MicrosoftIdTokenRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var oauthResponse = await _microsoftOAuthService.AuthenticateWithIdTokenAsync(
                request.IdToken,
                ipAddress,
                request.SelectedPlan,
                cancellationToken);

            var user = await _userManager.FindByIdAsync(oauthResponse.UserId.ToString());
            if (user == null)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "User Not Found",
                    Detail = "Failed to retrieve user after OAuth authentication.",
                });
            }

            LogMicrosoftOAuthSuccess(_logger, oauthResponse.UserId, oauthResponse.Email, oauthResponse.IsNewUser);

            // Get user's actual role from database
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.FirstOrDefault() ?? ApplicationRole.Owner; // Default to Owner for OAuth users

            return Ok(new LoginResponse
            {
                AccessToken = oauthResponse.AccessToken,
                RefreshToken = oauthResponse.RefreshToken,
                ExpiresAt = oauthResponse.ExpiresAt,
                TokenType = oauthResponse.TokenType,
                IsNewUser = oauthResponse.IsNewUser,
                User = new UserDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    BusinessId = user.BusinessId.ToString(),
                    Role = userRole,
                    EmailConfirmed = user.EmailConfirmed,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt.ToString("O"),
                },
            });
        }
        catch (InvalidOperationException ex)
        {
            LogMicrosoftOAuthFailed(_logger, ex.Message);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Authentication Failed",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Initiates Microsoft OAuth authentication flow.
    /// Returns the Microsoft authorization URL for the user to authenticate.
    /// </summary>
    /// <param name="request">The OAuth initiation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth initiation response with authorization URL.</returns>
    /// <response code="200">OAuth initiation successful. Returns authorization URL.</response>
    [HttpPost("microsoft/initiate")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OAuthInitiateResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<OAuthInitiateResponse>> InitiateMicrosoftOAuthAsync(
        [FromBody] MicrosoftOAuthRequest request,
        CancellationToken cancellationToken)
    {
        LogMicrosoftOAuthInitiated(_logger, request.ReturnUrl);

        var response = await _microsoftOAuthService.InitiateOAuthAsync(
            request.ReturnUrl,
            request.BusinessId,
            cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Handles the Microsoft OAuth callback.
    /// Exchanges the authorization code for tokens and creates/links user account.
    /// </summary>
    /// <param name="request">The OAuth callback request with authorization code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The OAuth login response with JWT tokens.</returns>
    /// <response code="200">OAuth authentication successful. Returns JWT tokens.</response>
    /// <response code="400">OAuth error or invalid state.</response>
    [HttpPost("microsoft/callback")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OAuthLoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OAuthLoginResponse>> HandleMicrosoftCallbackAsync(
        [FromBody] MicrosoftOAuthCallbackRequest request,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(request.Error))
        {
            LogMicrosoftOAuthError(_logger, request.Error, request.ErrorDescription);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Error",
                Detail = request.ErrorDescription ?? request.Error,
            });
        }

        if (string.IsNullOrEmpty(request.State) || !await _microsoftOAuthService.ValidateStateAsync(request.State, cancellationToken))
        {
            LogMicrosoftOAuthInvalidState(_logger);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid State",
                Detail = "The OAuth state parameter is invalid or expired.",
            });
        }

        try
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var response = await _microsoftOAuthService.HandleCallbackAsync(
                request.Code,
                request.State,
                ipAddress,
                cancellationToken);

            LogMicrosoftOAuthSuccess(_logger, response.UserId, response.Email, response.IsNewUser);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            LogMicrosoftOAuthFailed(_logger, ex.Message);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "OAuth Failed",
                Detail = ex.Message,
            });
        }
    }

    // ============================================================================
    // LoggerMessage Delegates (High-Performance Logging)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login validation failed for email: {Email}")]
    private static partial void LogLoginValidationFailed(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login attempt for non-existent email: {Email}")]
    private static partial void LogLoginAttemptNonExistentEmail(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login attempt for inactive user: {UserId}")]
    private static partial void LogLoginAttemptInactiveUser(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login attempt for deleted user: {UserId}")]
    private static partial void LogLoginAttemptDeletedUser(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Login attempt for locked out user: {UserId}")]
    private static partial void LogLoginAttemptLockedOutUser(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed login attempt for user: {UserId}")]
    private static partial void LogFailedLoginAttempt(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} ({Email}) logged in successfully from IP {IpAddress}")]
    private static partial void LogSuccessfulLogin(ILogger logger, Guid userId, string email, string ipAddress);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token validation failed for token: {RefreshToken}")]
    private static partial void LogRefreshTokenValidationFailed(ILogger logger, string refreshToken);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid or expired refresh token: {RefreshToken}")]
    private static partial void LogInvalidRefreshToken(ILogger logger, string refreshToken);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token user not found: {UserId}")]
    private static partial void LogRefreshTokenUserNotFound(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token attempt for inactive user: {UserId}")]
    private static partial void LogRefreshTokenInactiveUser(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Refresh token attempt for deleted user: {UserId}")]
    private static partial void LogRefreshTokenDeletedUser(ILogger logger, Guid userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} ({Email}) refreshed token successfully from IP {IpAddress}")]
    private static partial void LogSuccessfulTokenRefresh(ILogger logger, Guid userId, string email, string ipAddress);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Logout validation failed for token: {RefreshToken}")]
    private static partial void LogLogoutValidationFailed(ILogger logger, string refreshToken);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Logout attempt by unauthorized user")]
    private static partial void LogLogoutUnauthorized(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} logged out successfully from IP {IpAddress}")]
    private static partial void LogSuccessfulLogout(ILogger logger, Guid userId, string ipAddress);

    // Registration LoggerMessage Definitions
    [LoggerMessage(Level = LogLevel.Warning, Message = "Registration validation failed for email: {Email}")]
    private static partial void LogRegistrationValidationFailed(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Registration attempt with existing email: {Email}")]
    private static partial void LogRegistrationEmailExists(ILogger logger, string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Registration attempt with existing business name: {BusinessName}")]
    private static partial void LogRegistrationBusinessNameExists(ILogger logger, string businessName);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Registration failed for email: {Email}. Errors: {Errors}")]
    private static partial void LogRegistrationFailed(ILogger logger, string email, string errors);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} ({Email}) registered successfully with business {BusinessId} ({BusinessName})")]
    private static partial void LogSuccessfulRegistration(ILogger logger, Guid userId, string email, Guid businessId, string businessName);

    // OAuth LoggerMessage Definitions
    [LoggerMessage(Level = LogLevel.Information, Message = "Google OAuth initiated. ReturnUrl={ReturnUrl}")]
    private static partial void LogGoogleOAuthInitiated(ILogger logger, string? returnUrl);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Google OAuth error. Error={Error}, Description={Description}")]
    private static partial void LogGoogleOAuthError(ILogger logger, string error, string? description);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Google OAuth invalid state parameter")]
    private static partial void LogGoogleOAuthInvalidState(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Google OAuth success. UserId={UserId}, Email={Email}, IsNewUser={IsNewUser}")]
    private static partial void LogGoogleOAuthSuccess(ILogger logger, Guid userId, string email, bool isNewUser);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Google OAuth failed. Error={Error}")]
    private static partial void LogGoogleOAuthFailed(ILogger logger, string error);

    // Microsoft OAuth LoggerMessage Definitions
    [LoggerMessage(Level = LogLevel.Information, Message = "Microsoft OAuth initiated. ReturnUrl={ReturnUrl}")]
    private static partial void LogMicrosoftOAuthInitiated(ILogger logger, string? returnUrl);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Microsoft OAuth error. Error={Error}, Description={Description}")]
    private static partial void LogMicrosoftOAuthError(ILogger logger, string error, string? description);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Microsoft OAuth invalid state parameter")]
    private static partial void LogMicrosoftOAuthInvalidState(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Microsoft OAuth success. UserId={UserId}, Email={Email}, IsNewUser={IsNewUser}")]
    private static partial void LogMicrosoftOAuthSuccess(ILogger logger, Guid userId, string email, bool isNewUser);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Microsoft OAuth failed. Error={Error}")]
    private static partial void LogMicrosoftOAuthFailed(ILogger logger, string error);

    // Email Verification LoggerMessage Definitions
    [LoggerMessage(Level = LogLevel.Information, Message = "Email verification attempt for user: {UserId}")]
    private static partial void LogEmailVerificationAttempt(ILogger logger, string userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Resend verification email attempt for: {Email}")]
    private static partial void LogResendVerificationAttempt(ILogger logger, string email);

    // Static helper methods for registration
    private static BadRequestObjectResult CreateValidationProblem(FluentValidation.Results.ValidationResult validationResult)
    {
        return new BadRequestObjectResult(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed",
            Detail = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)),
        });
    }

    private static BadRequestObjectResult CreateEmailExistsProblem()
    {
        return new BadRequestObjectResult(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Email already exists",
            Detail = "An account with this email address already exists.",
        });
    }

    private static BadRequestObjectResult CreateBusinessNameExistsProblem()
    {
        return new BadRequestObjectResult(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Business name already exists",
            Detail = "A business with this name already exists. Please choose a different name.",
        });
    }

    private async Task<UnauthorizedObjectResult?> ValidateUserAsync(
        ApplicationUser? user,
        string email,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        if (user == null)
        {
            LogLoginAttemptNonExistentEmail(_logger, email);
            await _authAuditService.LogLoginFailedAsync(email, "User not found", ipAddress, userAgent, cancellationToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Invalid email or password.",
            });
        }

        if (!user.IsActive)
        {
            LogLoginAttemptInactiveUser(_logger, user.Id);
            await _authAuditService.LogLoginFailedAsync(email, "Account inactive", ipAddress, userAgent, cancellationToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Your account has been deactivated. Please contact support.",
            });
        }

        if (user.IsDeleted)
        {
            LogLoginAttemptDeletedUser(_logger, user.Id);
            await _authAuditService.LogLoginFailedAsync(email, "Account deleted", ipAddress, userAgent, cancellationToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Your account has been deleted. Please contact support.",
            });
        }

        return null;
    }

    private async Task<UnauthorizedObjectResult?> AuthenticateUserAsync(
        ApplicationUser user,
        string password,
        string email,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken)
    {
        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            LogLoginAttemptLockedOutUser(_logger, user.Id);
            await _authAuditService.LogLoginFailedAsync(email, "Account locked out", ipAddress, userAgent, cancellationToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Your account has been locked due to multiple failed login attempts. Please try again later.",
            });
        }

        if (!signInResult.Succeeded)
        {
            LogFailedLoginAttempt(_logger, user.Id);
            await _authAuditService.LogLoginFailedAsync(email, "Invalid password", ipAddress, userAgent, cancellationToken);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Invalid email or password.",
            });
        }

        return null;
    }

    private async Task<ActionResult<LoginResponse>> GenerateLoginResponseAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var refreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        // Get user's role
        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? ApplicationRole.Viewer;

        // Update LastLoginAt for audit purposes
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Log successful login to audit trail
        var userAgent = HttpContext.Request.Headers.UserAgent.ToString();
        await _authAuditService.LogLoginSuccessAsync(
            user.Id,
            user.Email ?? string.Empty,
            "Email/Password",
            ipAddress,
            userAgent,
            cancellationToken);

        LogSuccessfulLogin(_logger, user.Id, user.Email ?? string.Empty, ipAddress ?? "unknown");

#pragma warning disable CS0618 // Type or member is obsolete
        return Ok(new LoginResponse
        {
            User = new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                BusinessId = user.BusinessId.ToString(),
                Role = userRole,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt.ToString("o"),
                UpdatedAt = user.UpdatedAt?.ToString("o"),
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            TokenType = "Bearer",
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            BusinessId = user.BusinessId,
        });
#pragma warning restore CS0618 // Type or member is obsolete
    }

    private UnauthorizedObjectResult? ValidateUserForRefresh(ApplicationUser user)
    {
        if (!user.IsActive)
        {
            LogRefreshTokenInactiveUser(_logger, user.Id);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Your account has been deactivated. Please contact support.",
            });
        }

        if (user.IsDeleted)
        {
            LogRefreshTokenDeletedUser(_logger, user.Id);
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Authentication failed",
                Detail = "Your account has been deleted. Please contact support.",
            });
        }

        return null;
    }

    private async Task<ActionResult<LoginResponse>> RotateRefreshTokenAsync(
        ApplicationUser user,
        string oldRefreshToken,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Revoke old refresh token
        await _jwtTokenService.RevokeRefreshTokenAsync(oldRefreshToken, ipAddress, cancellationToken);

        // Generate new tokens
        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var newRefreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        // Get user's role
        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? ApplicationRole.Viewer;

        LogSuccessfulTokenRefresh(_logger, user.Id, user.Email ?? string.Empty, ipAddress ?? "unknown");

#pragma warning disable CS0618 // Type or member is obsolete
        return Ok(new LoginResponse
        {
            User = new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                BusinessId = user.BusinessId.ToString(),
                Role = userRole,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt.ToString("o"),
                UpdatedAt = user.UpdatedAt?.ToString("o"),
            },
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            TokenType = "Bearer",
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            BusinessId = user.BusinessId,
        });
#pragma warning restore CS0618 // Type or member is obsolete
    }

    // ============================================================================
    // REGISTRATION HELPER METHODS
    // ============================================================================

    private async Task<(Business business, ApplicationUser user, IdentityResult result)> CreateBusinessAndUserAsync(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var business = new Business
        {
            Id = Guid.NewGuid(),
            Name = request.BusinessName,
            Email = request.Email,
            Phone = request.PhoneNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await _dbContext.Businesses.AddAsync(business, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Create trial subscription with selected plan (defaults to FreeFlow)
        await CreateTrialSubscriptionAsync(business.Id, request.SelectedPlan, cancellationToken);

        // Initialize usage counters for the new business
        await _usageLimitService.EnsureUsageCountersExistAsync(business.Id, cancellationToken);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            BusinessId = business.Id,
            EmailConfirmed = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        return (business, user, createResult);
    }

    private async Task CreateTrialSubscriptionAsync(Guid businessId, string? selectedPlan, CancellationToken cancellationToken)
    {
        _logger.LogInformation("CreateTrialSubscriptionAsync called with selectedPlan='{SelectedPlan}' for business {BusinessId}", selectedPlan ?? "null", businessId);

        // SECURITY: ALWAYS start with FreeFlow plan during registration, regardless of selected plan.
        // The selected plan is only activated AFTER Stripe webhook confirms successful payment.
        // This prevents users from accessing paid features before payment is complete.
        // If user selected a paid plan, they will be redirected to Stripe checkout after registration,
        // and the StripeWebhooksController will upgrade their subscription upon payment success.
        var plan = await _dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Name == SubscriptionConstants.DefaultPlanName && p.IsActive, cancellationToken);

        if (plan == null)
        {
            _logger.LogError("FreeFlow plan not found. Cannot create trial subscription for business {BusinessId}", businessId);
            throw new InvalidOperationException("FreeFlow plan not found. Please contact support.");
        }

        _logger.LogInformation(
            "Creating FreeFlow subscription for business {BusinessId}. Selected plan '{SelectedPlan}' will be activated after payment confirmation.",
            businessId,
            selectedPlan ?? "none");

        // Determine subscription status and trial dates based on plan settings
        var now = DateTime.UtcNow;
        var hasTrial = plan.AllowsTrial && plan.TrialDays > 0;
        var status = hasTrial ? SubscriptionStatus.Trial : SubscriptionStatus.Active;

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

        await _dbContext.Set<Subscription>().AddAsync(subscription, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Created subscription for business {BusinessId} with plan {PlanName}, status {Status}, trial ends {TrialEnd}",
            businessId,
            plan.DisplayName,
            status,
            subscription.TrialEnd);
    }

    private async Task<ActionResult<RegisterResponse>> HandleUserCreationFailureAsync(
        Business business,
        string email,
        IdentityResult createResult,
        CancellationToken cancellationToken)
    {
        _dbContext.Businesses.Remove(business);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
        LogRegistrationFailed(_logger, email, errors);
        return BadRequest(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Registration failed",
            Detail = errors,
        });
    }

    private async Task<ActionResult<RegisterResponse>> GenerateRegistrationResponseAsync(
        ApplicationUser user,
        Business business,
        CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var refreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        // Get user's role
        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? ApplicationRole.Viewer;

        LogSuccessfulRegistration(_logger, user.Id, user.Email ?? string.Empty, business.Id, business.Name);

        // Return 201 Created with the response body (no location header needed for auth endpoints)
#pragma warning disable CS0618 // Type or member is obsolete
        return StatusCode(StatusCodes.Status201Created, new RegisterResponse
        {
            User = new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                BusinessId = user.BusinessId.ToString(),
                Role = userRole,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt.ToString("o"),
                UpdatedAt = user.UpdatedAt?.ToString("o"),
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            BusinessId = business.Id,
            BusinessName = business.Name,
        });
#pragma warning restore CS0618 // Type or member is obsolete
    }

    // ============================================================================
    // SECURITY SETTINGS ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets the current user's security settings.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Security settings including 2FA status, connected OAuth, sessions.</returns>
    [HttpGet("security")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(SecuritySettingsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SecuritySettingsDto>> GetSecuritySettingsAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        // Get connected OAuth providers
        var connectedProviders = new List<string>();
        if (!string.IsNullOrEmpty(user.GoogleId))
        {
            connectedProviders.Add("Google");
        }

        if (!string.IsNullOrEmpty(user.MicrosoftId))
        {
            connectedProviders.Add("Microsoft");
        }

        // Count active sessions (non-revoked refresh tokens)
        var activeSessionCount = await _dbContext.RefreshTokens
            .CountAsync(rt => rt.UserId == user.Id && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow, cancellationToken);

        return Ok(new SecuritySettingsDto
        {
            Email = user.Email ?? string.Empty,
            EmailVerified = user.EmailConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            ConnectedOAuthProviders = connectedProviders,
            IsOAuthUser = user.IsOAuthUser,
            HasPassword = await _userManager.HasPasswordAsync(user),
            PasswordLastChangedAt = null, // Would require tracking this in a separate field
            LastLoginAt = user.LastLoginAt,
            ActiveSessionCount = activeSessionCount,
            AccountCreatedAt = user.CreatedAt,
        });
    }

    /// <summary>
    /// Changes the current user's password.
    /// </summary>
    /// <param name="request">The change password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("change-password")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePasswordAsync(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        // Validate request using FluentValidation
        var validator = new ChangePasswordRequestValidator();
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", validationResult.Errors.Select(e => e.ErrorMessage)),
            });
        }

        // OAuth-only users need to set password first (different flow)
        if (user.IsOAuthUser && !await _userManager.HasPasswordAsync(user))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Password not set",
                Detail = "You registered via OAuth. Please use 'Set Password' to create a password first.",
            });
        }

        // Attempt to change password
        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authAuditService.LogPasswordChangeFailedAsync(user.Id, ipAddress, cancellationToken);

            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Password change failed",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
            });
        }

        // Log successful password change
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authAuditService.LogPasswordChangedAsync(user.Id, ip, cancellationToken);

        _logger.LogInformation("User {UserId} changed their password", user.Id);

        return Ok(new { message = "Password changed successfully" });
    }

    /// <summary>
    /// Gets all active sessions for the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of active sessions.</returns>
    [HttpGet("sessions")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(List<ActiveSessionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<ActiveSessionDto>>> GetActiveSessionsAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        // Get all active refresh tokens for this user
        var tokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userGuid && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);

        var sessions = tokens.Select(rt => new ActiveSessionDto
        {
            SessionId = rt.Id.ToString(),
            IpAddress = rt.CreatedByIp,
            UserAgent = null, // Would need to store user agent with token
            DeviceType = "Desktop", // Default - would need user agent parsing
            Browser = "Unknown",
            OperatingSystem = "Unknown",
            Location = null,
            CreatedAt = rt.CreatedAt,
            LastActivityAt = rt.CreatedAt, // Would need to track this separately
            ExpiresAt = rt.ExpiresAt,
            IsCurrentSession = false, // Can't determine without storing token hash
        }).ToList();

        return Ok(sessions);
    }

    /// <summary>
    /// Revokes a specific session.
    /// </summary>
    /// <param name="sessionId">The session ID to revoke.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpDelete("sessions/{sessionId}")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeSessionAsync(string sessionId, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(sessionId, out var tokenId))
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Session not found",
                Detail = "Invalid session ID format.",
            });
        }

        // Find the token and ensure it belongs to this user
        var token = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Id == tokenId && rt.UserId == userGuid, cancellationToken);

        if (token == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Session not found",
                Detail = "The specified session was not found or does not belong to you.",
            });
        }

        // Revoke the token
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} revoked session {SessionId}", userGuid, sessionId);

        return Ok(new { message = "Session revoked successfully" });
    }

    /// <summary>
    /// Revokes all sessions except the current one.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of sessions revoked.</returns>
    [HttpPost("sessions/revoke-all")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RevokeAllSessionsAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var userGuid))
        {
            return Unauthorized();
        }

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Revoke all tokens for this user
        var tokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userGuid && !rt.IsRevoked)
            .ToListAsync(cancellationToken);

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} revoked all {Count} sessions", userGuid, tokens.Count);

        return Ok(new { message = $"Revoked {tokens.Count} session(s). You will need to log in again." });
    }

    // ============================================================================
    // TWO-FACTOR AUTHENTICATION ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Initiates 2FA setup for the current user.
    /// Returns a QR code and secret for authenticator app setup.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>2FA setup information including QR code.</returns>
    [HttpPost("2fa/setup")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(TwoFactorSetupResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TwoFactorSetupResponse>> Setup2FAAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        if (user.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "2FA Already Enabled",
                Detail = "Two-factor authentication is already enabled for this account.",
            });
        }

        // Generate authenticator key using Identity
        await _userManager.ResetAuthenticatorKeyAsync(user);
        var authenticatorKey = await _userManager.GetAuthenticatorKeyAsync(user);

        if (string.IsNullOrEmpty(authenticatorKey))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Setup Failed",
                Detail = "Failed to generate authenticator key.",
            });
        }

#pragma warning disable S1075 // URIs should not be hardcoded - Intentional branding logo URL for authenticator apps
        const string logoUrl = "https://app.qualiflow.ai/assets/qualiflow-logo_no_text.png";
#pragma warning restore S1075
        var qrCodeUri = _twoFactorAuthService.GenerateQrCodeUri(
            user.Email ?? user.UserName ?? "user",
            authenticatorKey,
            "QualiFlow",
            logoUrl);
        var qrCodeImage = _twoFactorAuthService.GenerateQrCodeImage(qrCodeUri);

        _logger.LogInformation("User {UserId} initiated 2FA setup", user.Id);

        return Ok(new TwoFactorSetupResponse
        {
            Secret = authenticatorKey,
            QrCodeUri = qrCodeUri,
            QrCodeImage = $"data:image/png;base64,{qrCodeImage}",
        });
    }

    /// <summary>
    /// Enables 2FA after verifying the code from the authenticator app.
    /// </summary>
    /// <param name="request">The enable 2FA request with verification code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message and recovery codes.</returns>
    [HttpPost("2fa/enable")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(RecoveryCodesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RecoveryCodesResponse>> Enable2FAAsync(
        [FromBody] EnableTwoFactorRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        if (user.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "2FA Already Enabled",
                Detail = "Two-factor authentication is already enabled for this account.",
            });
        }

        // Verify the code
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            request.Code);

        if (!isValid)
        {
            _logger.LogWarning("User {UserId} provided invalid 2FA code during setup", user.Id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Code",
                Detail = "The verification code is invalid. Please try again.",
            });
        }

        // Enable 2FA
        await _userManager.SetTwoFactorEnabledAsync(user, true);

        // Generate recovery codes
        var recoveryCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authAuditService.Log2FAEnabledAsync(user.Id, ipAddress, cancellationToken);

        _logger.LogInformation("User {UserId} enabled 2FA", user.Id);

        return Ok(new RecoveryCodesResponse
        {
            RecoveryCodes = recoveryCodes?.ToList() ?? [],
            Message = "Two-factor authentication has been enabled. Save these recovery codes securely - each can only be used once.",
        });
    }

    /// <summary>
    /// Disables 2FA for the current user.
    /// </summary>
    /// <param name="request">The disable 2FA request with verification.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    [HttpPost("2fa/disable")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Disable2FAAsync(
        [FromBody] DisableTwoFactorRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        if (!user.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "2FA Not Enabled",
                Detail = "Two-factor authentication is not enabled for this account.",
            });
        }

        // Verify password
        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Password",
                Detail = "The password is incorrect.",
            });
        }

        // Verify the 2FA code
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            request.Code);

        if (!isValid)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Code",
                Detail = "The verification code is invalid.",
            });
        }

        // Disable 2FA
        await _userManager.SetTwoFactorEnabledAsync(user, false);
        await _userManager.ResetAuthenticatorKeyAsync(user);

        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authAuditService.Log2FADisabledAsync(user.Id, ipAddress, cancellationToken);

        _logger.LogInformation("User {UserId} disabled 2FA", user.Id);

        return Ok(new { message = "Two-factor authentication has been disabled." });
    }

    /// <summary>
    /// Verifies a 2FA code during login.
    /// </summary>
    /// <param name="request">The 2FA verification request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with tokens if successful.</returns>
    [HttpPost("2fa/verify")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Verify2FAAsync(
        [FromBody] VerifyTwoFactorRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Invalid user ID.",
            });
        }

        if (!user.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "2FA Not Required",
                Detail = "Two-factor authentication is not enabled for this account.",
            });
        }

        // Try authenticator code first
        var isValid = await _userManager.VerifyTwoFactorTokenAsync(
            user,
            _userManager.Options.Tokens.AuthenticatorTokenProvider,
            request.Code);

        // If not valid, try recovery code
        if (!isValid)
        {
            var result = await _userManager.RedeemTwoFactorRecoveryCodeAsync(user, request.Code);
            isValid = result.Succeeded;

            if (isValid)
            {
                _logger.LogWarning("User {UserId} used a recovery code for 2FA", user.Id);
            }
        }

        if (!isValid)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authAuditService.Log2FAFailedAsync(user.Id, ipAddress, cancellationToken);

            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid Code",
                Detail = "The verification code is invalid.",
            });
        }

        // 2FA verified - complete login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Get business
        var business = await _dbContext.Businesses
            .FirstOrDefaultAsync(b => b.Id == user.BusinessId && b.DeletedAt == null, cancellationToken);

        if (business == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Business not found.",
            });
        }

        // Generate tokens
        var accessToken = await _jwtTokenService.GenerateAccessTokenAsync(user, cancellationToken);
        var refreshToken = await _jwtTokenService.GenerateRefreshTokenAsync(
            user.Id,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        var ipAddr = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authAuditService.Log2FAVerifiedAsync(user.Id, ipAddr, cancellationToken);

        _logger.LogInformation("User {UserId} completed 2FA verification", user.Id);

        // Get user role
        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault() ?? "User";

#pragma warning disable CS0618 // Type or member is obsolete - backward compatibility
        return Ok(new LoginResponse
        {
            User = new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                BusinessId = user.BusinessId.ToString(),
                Role = userRole,
                IsActive = user.IsActive,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt.ToString("o"),
                UpdatedAt = user.UpdatedAt?.ToString("o"),
            },
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            BusinessId = business.Id,
        });
#pragma warning restore CS0618
    }

    /// <summary>
    /// Generates new recovery codes for the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>New recovery codes.</returns>
    [HttpPost("2fa/recovery-codes")]
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ProducesResponseType(typeof(RecoveryCodesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RecoveryCodesResponse>> GenerateRecoveryCodesAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized();
        }

        if (!user.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "2FA Not Enabled",
                Detail = "Two-factor authentication must be enabled to generate recovery codes.",
            });
        }

        var recoveryCodes = await _userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 10);

        _logger.LogInformation("User {UserId} generated new recovery codes", user.Id);

        return Ok(new RecoveryCodesResponse
        {
            RecoveryCodes = recoveryCodes?.ToList() ?? [],
            Message = "New recovery codes generated. Previous codes are now invalid.",
        });
    }

    /// <summary>
    /// Initiates password reset process by sending reset email to user.
    /// </summary>
    /// <param name="request">The forgot password request containing email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message (always returns 200 to prevent email enumeration).</returns>
    /// <response code="200">Reset email sent if account exists.</response>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> ForgotPasswordAsync(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);

        // Always return success to prevent email enumeration
        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
            return Ok(new { message = "If an account exists with this email, a password reset link will be sent." });
        }

        // Generate reset token using ASP.NET Identity
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Send reset email
#pragma warning disable S1075 // Hardcoded URI is a fallback for development
        var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:3000";
#pragma warning restore S1075
        var resetUrl = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}&email={Uri.EscapeDataString(request.Email)}";

        var emailBody = $@"
            <html>
            <body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333;"">
                <div style=""max-width: 600px; margin: 0 auto; padding: 20px;"">
                    <h2 style=""color: #6366F1;"">🔒 Password Reset Request</h2>
                    <p>Hi {user.FirstName ?? "there"},</p>
                    <p>You requested to reset your password for QualiFlow.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style=""text-align: center; margin: 30px 0;"">
                        <a href=""{resetUrl}""
                           style=""background-color: #6366F1; color: white; padding: 12px 30px;
                                  text-decoration: none; border-radius: 5px; display: inline-block;"">
                            Reset Password
                        </a>
                    </div>
                    <p style=""color: #666; font-size: 14px;"">
                        This link expires in <strong>1 hour</strong>.
                    </p>
                    <p style=""color: #666; font-size: 14px;"">
                        If you didn't request this, please ignore this email.
                    </p>
                    <hr style=""border: none; border-top: 1px solid #eee; margin: 30px 0;"" />
                    <p style=""color: #999; font-size: 12px;"">
                        QualiFlow<br/>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </body>
            </html>";

        try
        {
            await _emailService.SendEmailAsync(
                new Application.Features.Email.DTOs.SendEmailRequest
                {
                    ToEmail = user.Email!,
                    Subject = "Password Reset - QualiFlow",
                    HtmlBody = emailBody,
                    FromEmail = _configuration["Email:FromAddress"] ?? "noreply@qualiflow.ai",
                },
                cancellationToken);

            _logger.LogInformation("Password reset email sent to: {Email}", request.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to: {Email}", request.Email);

            // Still return success to prevent email enumeration
        }

        return Ok(new { message = "If an account exists with this email, a password reset link will be sent." });
    }

    /// <summary>
    /// Resets user password using the reset token.
    /// </summary>
    /// <param name="request">The reset password request containing token and new password.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success or error message.</returns>
    /// <response code="200">Password reset successful.</response>
    /// <response code="400">Invalid or expired token, or password requirements not met.</response>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ResetPasswordAsync(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Reset Failed",
                Detail = "Invalid or expired reset token.",
            });
        }

        // Validate password strength
        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Password Too Weak",
                Detail = "Password must be at least 8 characters long.",
            });
        }

        // Reset password using ASP.NET Identity
        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Password reset failed for {Email}: {Errors}", request.Email, errors);

            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Reset Failed",
                Detail = errors.Contains("Invalid token", StringComparison.OrdinalIgnoreCase)
                    ? "Invalid or expired reset token."
                    : errors,
            });
        }

        // Log the successful password reset
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _authAuditService.LogPasswordChangedAsync(user.Id, ipAddress, cancellationToken);

        _logger.LogInformation("Password reset successful for: {Email}", request.Email);

        return Ok(new { message = "Password has been reset successfully. You can now log in with your new password." });
    }
}

