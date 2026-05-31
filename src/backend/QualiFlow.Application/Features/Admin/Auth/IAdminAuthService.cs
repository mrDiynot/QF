// -----------------------------------------------------------------------
// <copyright file="IAdminAuthService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Admin.Auth.DTOs;

namespace QualiFlow.Application.Features.Admin.Auth;

/// <summary>
/// Service interface for admin authentication operations.
/// Admin authentication is separate from business user authentication for security isolation.
/// </summary>
public interface IAdminAuthService
{
    /// <summary>
    /// Authenticates an admin user with email and password.
    /// </summary>
    /// <param name="request">The login request containing credentials.</param>
    /// <param name="ipAddress">The IP address of the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The authentication result with tokens if successful.</returns>
    Task<AdminLoginResponse> LoginAsync(
        AdminLoginRequest request,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refreshes an admin's access token using a valid refresh token.
    /// </summary>
    /// <param name="refreshToken">The refresh token.</param>
    /// <param name="ipAddress">The IP address of the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>New tokens if successful.</returns>
    Task<AdminTokenResponse> RefreshTokenAsync(
        string refreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs out an admin by invalidating their refresh token.
    /// </summary>
    /// <param name="adminId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task LogoutAsync(Guid adminId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Changes an admin's password.
    /// </summary>
    /// <param name="adminId">The admin user ID.</param>
    /// <param name="request">The change password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ChangePasswordAsync(
        Guid adminId,
        AdminChangePasswordRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the current admin user's profile.
    /// </summary>
    /// <param name="adminId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The admin profile.</returns>
    Task<AdminProfileResponse> GetProfileAsync(
        Guid adminId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies a 2FA code for an admin user.
    /// </summary>
    /// <param name="adminId">The admin user ID.</param>
    /// <param name="code">The TOTP code.</param>
    /// <param name="ipAddress">The IP address of the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The tokens if verification successful.</returns>
    Task<AdminTokenResponse> Verify2FAAsync(
        Guid adminId,
        string code,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Initiates password reset process by sending reset email.
    /// </summary>
    /// <param name="request">The forgot password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ForgotPasswordAsync(
        AdminForgotPasswordRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Resets admin password using a valid reset token.
    /// </summary>
    /// <param name="request">The reset password request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ResetPasswordAsync(
        AdminResetPasswordRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Emergency password reset without email verification.
    /// This is protected by a secret key in the controller.
    /// </summary>
    /// <param name="email">The admin email address.</param>
    /// <param name="newPassword">The new password to set.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if reset was successful, false if admin not found.</returns>
    Task<bool> EmergencyResetPasswordAsync(
        string email,
        string newPassword,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Enables 2FA for an admin user by verifying the setup code and storing the secret.
    /// </summary>
    /// <param name="adminId">The admin user ID.</param>
    /// <param name="secret">The TOTP secret from setup.</param>
    /// <param name="code">The verification code from authenticator app.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if 2FA was enabled successfully.</returns>
    Task<bool> Enable2FAAsync(
        Guid adminId,
        string secret,
        string code,
        CancellationToken cancellationToken = default);
}
