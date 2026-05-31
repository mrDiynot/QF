using QualiFlow.Application.Features.Admin.UserManagement.DTOs;

namespace QualiFlow.Application.Features.Admin.UserManagement;

/// <summary>
/// Service interface for admin user impersonation functionality.
/// </summary>
public interface IUserImpersonationService
{
    /// <summary>
    /// Starts an impersonation session for the specified user.
    /// </summary>
    /// <param name="adminUserId">The admin user ID starting the impersonation.</param>
    /// <param name="targetUserId">The target user ID to impersonate.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The impersonation token with 1-hour expiry.</returns>
    Task<ImpersonationTokenDto> StartImpersonationAsync(
        Guid adminUserId,
        Guid targetUserId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Stops the current impersonation session.
    /// </summary>
    /// <param name="adminUserId">The admin user ID stopping the impersonation.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task StopImpersonationAsync(
        Guid adminUserId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Validates an impersonation token.
    /// </summary>
    /// <param name="token">The impersonation token to validate.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the token is valid and not expired, false otherwise.</returns>
    Task<bool> ValidateImpersonationTokenAsync(
        string token,
        CancellationToken cancellationToken);
}

