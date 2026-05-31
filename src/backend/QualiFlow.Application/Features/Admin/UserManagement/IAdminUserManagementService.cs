using QualiFlow.Application.Features.Admin.UserManagement.DTOs;

namespace QualiFlow.Application.Features.Admin.UserManagement;

/// <summary>
/// Service for managing platform users by administrators.
/// Provides CRUD operations, user suspension, password reset, and impersonation.
/// </summary>
public interface IAdminUserManagementService
{
    /// <summary>
    /// Gets a paginated list of all users across all businesses.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of users.</returns>
    Task<PagedResult<AdminUserListDto>> GetAllUsersAsync(
        AdminUserQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets detailed information about a specific user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed user information.</returns>
    Task<AdminUserDetailDto?> GetUserByIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a user's information.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="request">Update request with new values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated user information.</returns>
    Task<AdminUserDetailDto> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft deletes a user account.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a password reset email to a user.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SendPasswordResetEmailAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Suspends a user account.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="reason">Reason for suspension.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SuspendUserAsync(
        Guid userId,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reactivates a suspended user account.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReactivateUserAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Paged result container.
/// </summary>
/// <typeparam name="T">The type of items in the result.</typeparam>
public class PagedResult<T>
{
    /// <summary>
    /// Gets the items in the current page.
    /// </summary>
    public required IReadOnlyList<T> Items { get; init; }

    /// <summary>
    /// Gets the total number of items across all pages.
    /// </summary>
    public required int TotalItems { get; init; }

    /// <summary>
    /// Gets the current page number (1-based).
    /// </summary>
    public required int Page { get; init; }

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public required int PageSize { get; init; }

    /// <summary>
    /// Gets the total number of pages.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);

    /// <summary>
    /// Gets a value indicating whether there is a next page.
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Gets a value indicating whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage => Page > 1;
}

