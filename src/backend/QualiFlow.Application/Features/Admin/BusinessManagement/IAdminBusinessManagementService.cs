using QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

namespace QualiFlow.Application.Features.Admin.BusinessManagement;

/// <summary>
/// Service for managing businesses (tenants) by administrators.
/// </summary>
public interface IAdminBusinessManagementService
{
    /// <summary>
    /// Gets a paginated list of all businesses.
    /// </summary>
    /// <param name="query">Query parameters for filtering and pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of businesses.</returns>
    Task<PagedResult<AdminBusinessListDto>> GetAllBusinessesAsync(
        AdminBusinessQuery query,
        CancellationToken cancellationToken);

    /// <summary>
    /// Gets detailed information about a specific business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed business information.</returns>
    Task<AdminBusinessDetailDto?> GetBusinessByIdAsync(
        Guid businessId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Updates a business's information.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">Update request with new values.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated business information.</returns>
    Task<AdminBusinessDetailDto> UpdateBusinessAsync(
        Guid businessId,
        UpdateBusinessRequest request,
        CancellationToken cancellationToken);

    /// <summary>
    /// Suspends a business account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="reason">Suspension reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task SuspendBusinessAsync(
        Guid businessId,
        string reason,
        CancellationToken cancellationToken);

    /// <summary>
    /// Reactivates a suspended business account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReactivateBusinessAsync(
        Guid businessId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a business account (soft delete).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteBusinessAsync(
        Guid businessId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Gets recent activity for a specific business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of business activity items.</returns>
    Task<PagedResult<BusinessActivityItemDto>> GetBusinessActivityAsync(
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for a business activity item.
/// </summary>
public class BusinessActivityItemDto
{
    /// <summary>Gets or sets the activity ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the action performed.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Gets or sets the actor name or email.</summary>
    public string Actor { get; set; } = string.Empty;

    /// <summary>Gets or sets the actor's email.</summary>
    public string? ActorEmail { get; set; }

    /// <summary>Gets or sets the timestamp.</summary>
    public DateTime Timestamp { get; set; }

    /// <summary>Gets or sets additional details.</summary>
    public string? Details { get; set; }
}

/// <summary>
/// Generic paged result container.
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

