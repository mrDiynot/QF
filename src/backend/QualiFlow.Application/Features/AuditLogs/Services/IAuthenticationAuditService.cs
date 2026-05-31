// -----------------------------------------------------------------------
// <copyright file="IAuthenticationAuditService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AuditLogs.Services;

/// <summary>
/// Service interface for logging authentication-related audit events.
/// </summary>
public interface IAuthenticationAuditService
{
    /// <summary>
    /// Logs a successful login event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogLoginSuccessAsync(
        Guid userId,
        string email,
        string provider,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a failed login attempt.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogLoginFailedAsync(
        string email,
        string reason,
        string? ipAddress,
        string? userAgent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a logout event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogLogoutAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a password change event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogPasswordChangedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a failed password change attempt.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogPasswordChangeFailedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs MFA enabled/disabled event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogMfaStatusChangedAsync(
        Guid userId,
        bool enabled,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs an OAuth provider connection event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogOAuthConnectedAsync(
        Guid userId,
        string provider,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a token refresh event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogTokenRefreshedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs a session timeout/expiry event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogSessionExpiredAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs an access denied event.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task LogAccessDeniedAsync(
        Guid? userId,
        string resource,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs when 2FA is enabled.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task Log2FAEnabledAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs when 2FA is disabled.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task Log2FADisabledAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs successful 2FA verification during login.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task Log2FAVerifiedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Logs failed 2FA verification attempt.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task Log2FAFailedAsync(
        Guid userId,
        string? ipAddress,
        CancellationToken cancellationToken = default);
}

