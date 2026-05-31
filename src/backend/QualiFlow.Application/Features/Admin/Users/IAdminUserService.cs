using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.Users.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Admin.Users;

/// <summary>
/// Service interface for managing admin users.
/// Admin users are independent from business users with their own credentials.
/// </summary>
public interface IAdminUserService
{
    /// <summary>
    /// Creates a new admin user with a temporary password.
    /// </summary>
    /// <param name="request">The create admin user request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created admin user with temporary password.</returns>
    Task<CreateAdminUserResponse> CreateAdminUserAsync(CreateAdminUserRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Gets an admin user by ID.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The admin user, or null if not found.</returns>
    Task<AdminUserDto?> GetAdminUserAsync(Guid adminUserId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets an admin user by email address.
    /// </summary>
    /// <param name="email">The admin's email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The admin user, or null if not found.</returns>
    Task<AdminUserDto?> GetAdminUserByEmailAsync(string email, CancellationToken cancellationToken);

    /// <summary>
    /// Gets a paginated list of admin users.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of admin users.</returns>
    Task<PagedResult<AdminUserDto>> GetAdminUsersAsync(AdminUserQuery query, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an admin user's role.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="newRole">The new admin role.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated admin user.</returns>
    Task<AdminUserDto> UpdateAdminRoleAsync(Guid adminUserId, AdminRole newRole, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an admin user's IP whitelist.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="ipWhitelist">The new IP whitelist.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated admin user.</returns>
    Task<AdminUserDto> UpdateIpWhitelistAsync(Guid adminUserId, IReadOnlyList<string> ipWhitelist, CancellationToken cancellationToken);

    /// <summary>
    /// Deactivates an admin user.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeactivateAdminUserAsync(Guid adminUserId, CancellationToken cancellationToken);

    /// <summary>
    /// Reactivates an admin user.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The reactivated admin user.</returns>
    Task<AdminUserDto> ReactivateAdminUserAsync(Guid adminUserId, CancellationToken cancellationToken);

    /// <summary>
    /// Resets an admin user's password and generates a new temporary password.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The new temporary password.</returns>
    Task<string> ResetPasswordAsync(Guid adminUserId, CancellationToken cancellationToken);

    /// <summary>
    /// Records a successful login for an admin user.
    /// </summary>
    /// <param name="adminUserId">The admin user ID.</param>
    /// <param name="ipAddress">The IP address of the login.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RecordLoginAsync(Guid adminUserId, string? ipAddress, CancellationToken cancellationToken);
}
