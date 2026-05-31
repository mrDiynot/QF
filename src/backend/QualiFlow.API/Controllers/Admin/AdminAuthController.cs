// -----------------------------------------------------------------------
// <copyright file="AdminAuthController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.Application.Features.Admin.Auth;
using QualiFlow.Application.Features.Admin.Auth.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Controller for admin authentication operations.
/// Admin authentication is completely separate from business user authentication.
/// Uses a dedicated JWT scheme (AdminBearer) for security isolation.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/auth")]
[Produces("application/json")]
public class AdminAuthController : ControllerBase
{
    private readonly IAdminAuthService _adminAuthService;
    private readonly ITwoFactorAuthService _twoFactorAuthService;
    private readonly ILogger<AdminAuthController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAuthController"/> class.
    /// </summary>
    public AdminAuthController(
        IAdminAuthService adminAuthService,
        ITwoFactorAuthService twoFactorAuthService,
        ILogger<AdminAuthController> logger)
    {
        _adminAuthService = adminAuthService;
        _twoFactorAuthService = twoFactorAuthService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates an admin user with email and password.
    /// </summary>
    /// <param name="request">The login request containing credentials.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Authentication result with tokens if successful, or 2FA required flag.</returns>
    /// <response code="200">Login successful or 2FA/password change required.</response>
    /// <response code="401">Invalid credentials or account locked.</response>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AdminLoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminLoginResponse>> Login(
        [FromBody] AdminLoginRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = GetIpAddress();
        var result = await _adminAuthService.LoginAsync(request, ipAddress, cancellationToken);

        // Set cookie for Hangfire dashboard access (only when tokens are issued)
        if (result.Tokens != null)
        {
            SetAdminAccessTokenCookie(result.Tokens.AccessToken, result.Tokens.ExpiresAt);
        }

        return Ok(result);
    }

    /// <summary>
    /// Verifies 2FA code after successful password authentication.
    /// </summary>
    /// <param name="request">The 2FA verification request containing admin ID and code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Tokens if verification successful.</returns>
    /// <response code="200">2FA verification successful.</response>
    /// <response code="401">Invalid 2FA code.</response>
    [HttpPost("verify-2fa")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AdminTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminTokenResponse>> Verify2FA(
        [FromBody] AdminVerify2FARequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = GetIpAddress();
        var result = await _adminAuthService.Verify2FAAsync(
            request.AdminId,
            request.Code,
            ipAddress,
            cancellationToken);

        SetAdminAccessTokenCookie(result.AccessToken, result.ExpiresAt);

        return Ok(result);
    }

    /// <summary>
    /// Refreshes an admin's access token using a valid refresh token.
    /// </summary>
    /// <param name="request">The refresh token request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>New tokens if successful.</returns>
    /// <response code="200">Token refresh successful.</response>
    /// <response code="401">Invalid or expired refresh token.</response>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AdminTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminTokenResponse>> RefreshToken(
        [FromBody] AdminRefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var ipAddress = GetIpAddress();
        var result = await _adminAuthService.RefreshTokenAsync(request.RefreshToken, ipAddress, cancellationToken);

        SetAdminAccessTokenCookie(result.AccessToken, result.ExpiresAt);

        return Ok(result);
    }

    /// <summary>
    /// Logs out the current admin user by invalidating their refresh token.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <response code="204">Logout successful.</response>
    /// <response code="401">Not authenticated.</response>
    [HttpPost("logout")]
    [Authorize(AuthenticationSchemes = "AdminBearer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> Logout(CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        await _adminAuthService.LogoutAsync(adminId, cancellationToken);

        ClearAdminAccessTokenCookie();

        return NoContent();
    }

    /// <summary>
    /// Gets the current admin user's profile.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The admin profile.</returns>
    /// <response code="200">Profile retrieved successfully.</response>
    /// <response code="401">Not authenticated.</response>
    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = "AdminBearer")]
    [ProducesResponseType(typeof(AdminProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminProfileResponse>> GetProfile(CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var result = await _adminAuthService.GetProfileAsync(adminId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Changes the current admin user's password.
    /// Required on first login if MustChangePassword is true.
    /// </summary>
    /// <param name="request">The change password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <response code="204">Password changed successfully.</response>
    /// <response code="400">Invalid request or password requirements not met.</response>
    /// <response code="401">Not authenticated or current password incorrect.</response>
    [HttpPost("change-password")]
    [Authorize(AuthenticationSchemes = "AdminBearer")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> ChangePassword(
        [FromBody] AdminChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        await _adminAuthService.ChangePasswordAsync(adminId, request, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Initiates password reset process by sending reset email to admin.
    /// </summary>
    /// <param name="request">The forgot password request containing email.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message (always returns 200 to prevent email enumeration).</returns>
    /// <response code="200">Reset email sent if account exists.</response>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult> ForgotPassword(
        [FromBody] AdminForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await _adminAuthService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
    }

    /// <summary>
    /// Resets admin password using a valid reset token from email.
    /// </summary>
    /// <param name="request">The reset password request containing token and new password.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message.</returns>
    /// <response code="200">Password reset successful.</response>
    /// <response code="400">Invalid token or password requirements not met.</response>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> ResetPassword(
        [FromBody] AdminResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await _adminAuthService.ResetPasswordAsync(request, cancellationToken);
        return Ok(new { message = "Password reset successful. You can now login with your new password." });
    }

    /// <summary>
    /// Emergency password reset for admin - requires secret key.
    /// This endpoint allows resetting an admin password without email verification.
    /// Protected by a secret key that must be configured in the environment.
    /// </summary>
    /// <param name="request">The emergency reset request.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success message if reset was successful.</returns>
    [HttpPost("emergency-reset")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> EmergencyPasswordReset(
        [FromBody] EmergencyResetRequest request,
        [FromServices] IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        // Verify secret key
        var configuredSecret = configuration["AdminSeed:EmergencyResetKey"];
        if (string.IsNullOrEmpty(configuredSecret) || request.SecretKey != configuredSecret)
        {
            _logger.LogWarning("Emergency reset attempted with invalid secret key for {Email}", request.Email);
            return Forbid();
        }

        var result = await _adminAuthService.EmergencyResetPasswordAsync(
            request.Email,
            request.NewPassword,
            cancellationToken);

        if (!result)
        {
            return BadRequest(new { message = "Admin user not found or password reset failed." });
        }

        _logger.LogWarning("Emergency password reset performed for admin {Email}", request.Email);
        return Ok(new { message = "Password reset successful. You can now login with your new password." });
    }

    /// <summary>
    /// Initiates 2FA setup using session token (for first-time MFA setup).
    /// Returns a QR code and secret for authenticator app setup.
    /// </summary>
    /// <param name="request">The setup request containing session token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>2FA setup information including QR code.</returns>
    /// <response code="200">2FA setup initiated.</response>
    /// <response code="401">Invalid session token.</response>
    /// <response code="400">2FA is already enabled.</response>
    [HttpPost("setup-2fa")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Setup2FAResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Setup2FAResponse>> Setup2FA(
        [FromBody] Setup2FARequest request,
        CancellationToken cancellationToken)
    {
        // Validate session token and extract admin ID
        var adminId = ValidateSessionToken(request.SessionToken);
        if (adminId == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Invalid or expired session token.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var profile = await _adminAuthService.GetProfileAsync(adminId.Value, cancellationToken);

        if (profile.TwoFactorEnabled)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = "2FA is already enabled for this account.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var secret = _twoFactorAuthService.GenerateSecret();
#pragma warning disable S1075 // URIs should not be hardcoded - Intentional branding logo URL for authenticator apps
        const string logoUrl = "https://app.qualiflow.ai/assets/qualiflow-logo_no_text.png";
#pragma warning restore S1075
        var qrCodeUri = _twoFactorAuthService.GenerateQrCodeUri(profile.Email, secret, "QualiFlow Admin", logoUrl);
        var qrCodeImage = _twoFactorAuthService.GenerateQrCodeImage(qrCodeUri);

        return Ok(new Setup2FAResponse
        {
            Secret = secret,
            QrCodeUri = qrCodeUri,
            QrCodeImage = qrCodeImage
        });
    }

    /// <summary>
    /// Enables 2FA using session token after verifying the setup code.
    /// </summary>
    /// <param name="request">The enable 2FA request containing session token, secret and verification code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Tokens if successful.</returns>
    /// <response code="200">2FA enabled successfully, returns auth tokens.</response>
    /// <response code="400">Invalid verification code.</response>
    /// <response code="401">Invalid session token.</response>
    [HttpPost("enable-2fa")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AdminTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AdminTokenResponse>> Enable2FA(
        [FromBody] Enable2FAWithTokenRequest request,
        CancellationToken cancellationToken)
    {
        // Validate session token and extract admin ID
        var adminId = ValidateSessionToken(request.SessionToken);
        if (adminId == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Invalid or expired session token.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var success = await _adminAuthService.Enable2FAAsync(
            adminId.Value,
            request.Secret,
            request.Code,
            cancellationToken);

        if (!success)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Bad Request",
                Detail = "Invalid verification code. Please try again.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Generate tokens after successful MFA setup
        var ipAddress = GetIpAddress();
        var tokens = await _adminAuthService.Verify2FAAsync(adminId.Value, request.Code, ipAddress, cancellationToken);

        SetAdminAccessTokenCookie(tokens.AccessToken, tokens.ExpiresAt);

        return Ok(tokens);
    }

    private static Guid? ValidateSessionToken(string? sessionToken)
    {
        if (string.IsNullOrEmpty(sessionToken))
        {
            return null;
        }

        try
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(sessionToken);

            // Check if token is expired
            if (token.ValidTo < DateTime.UtcNow)
            {
                return null;
            }

            // Check purpose claim
            var purposeClaim = token.Claims.FirstOrDefault(c => c.Type == "purpose")?.Value;
            if (purposeClaim != "mfa_setup")
            {
                return null;
            }

            // Get admin ID
            var adminIdClaim = token.Claims.FirstOrDefault(c => c.Type == "admin_id")?.Value;
            if (string.IsNullOrEmpty(adminIdClaim) || !Guid.TryParse(adminIdClaim, out var adminId))
            {
                return null;
            }

            return adminId;
        }
        catch
        {
            return null;
        }
    }

    private string? GetIpAddress()
    {
        // Check for forwarded IP (behind proxy/load balancer)
        if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            var ip = forwardedFor.ToString().Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(ip))
            {
                return ip;
            }
        }

        if (Request.Headers.TryGetValue("X-Real-IP", out var realIp))
        {
            return realIp.ToString();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private Guid GetCurrentAdminId()
    {
        var adminIdClaim = User.FindFirst("admin_id")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(adminIdClaim) || !Guid.TryParse(adminIdClaim, out var adminId))
        {
            throw new UnauthorizedAccessException("Admin ID not found in token.");
        }

        return adminId;
    }

    /// <summary>
    /// Sets the admin access token as an HTTP-only cookie for Hangfire dashboard access.
    /// The cookie is scoped to the API domain so the Hangfire authorization filter can read it.
    /// </summary>
    private void SetAdminAccessTokenCookie(string accessToken, DateTime expiresAt)
    {
        var isProduction = !HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        Response.Cookies.Append("admin_access_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
            Path = "/",
            Expires = new DateTimeOffset(expiresAt, TimeSpan.Zero),
        });
    }

    /// <summary>
    /// Clears the admin access token cookie on logout.
    /// </summary>
    private void ClearAdminAccessTokenCookie()
    {
        Response.Cookies.Delete("admin_access_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = !HttpContext.RequestServices
                .GetRequiredService<IWebHostEnvironment>().IsDevelopment(),
            SameSite = SameSiteMode.None,
            Path = "/",
        });
    }
}

/// <summary>
/// Request DTO for refreshing admin tokens.
/// Named AdminRefreshTokenRequest to avoid Swagger schema conflict with
/// QualiFlow.Application.Features.Auth.DTOs.RefreshTokenRequest.
/// </summary>
public sealed record AdminRefreshTokenRequest
{
    /// <summary>
    /// Gets the refresh token.
    /// </summary>
    public required string RefreshToken { get; init; }
}

/// <summary>
/// Request DTO for emergency password reset.
/// </summary>
/// <param name="Email">The admin email address.</param>
/// <param name="NewPassword">The new password to set.</param>
/// <param name="SecretKey">The secret key for authorization.</param>
public sealed record EmergencyResetRequest(string Email, string NewPassword, string SecretKey);

/// <summary>
/// Request DTO for 2FA setup with session token.
/// </summary>
/// <param name="SessionToken">The session token from login.</param>
public sealed record Setup2FARequest(string SessionToken);

/// <summary>
/// Request DTO for enabling 2FA with session token.
/// </summary>
/// <param name="SessionToken">The session token from login.</param>
/// <param name="Secret">The TOTP secret from setup.</param>
/// <param name="Code">The 6-digit verification code from authenticator app.</param>
public sealed record Enable2FAWithTokenRequest(string SessionToken, string Secret, string Code);

/// <summary>
/// Response DTO for 2FA setup.
/// </summary>
[System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "String is required for JSON serialization of otpauth:// protocol")]
public sealed record Setup2FAResponse
{
    /// <summary>
    /// Gets the TOTP secret (base32 encoded).
    /// </summary>
    public required string Secret { get; init; }

    /// <summary>
    /// Gets the QR code URI (otpauth://).
    /// </summary>
    public required string QrCodeUri { get; init; }

    /// <summary>
    /// Gets the QR code image as base64 PNG.
    /// </summary>
    public required string QrCodeImage { get; init; }
}
