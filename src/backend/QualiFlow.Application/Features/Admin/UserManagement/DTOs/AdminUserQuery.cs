namespace QualiFlow.Application.Features.Admin.UserManagement.DTOs;

/// <summary>
/// Query parameters for filtering and paginating users.
/// </summary>
public class AdminUserQuery
{
    /// <summary>
    /// Gets or sets the page number (1-based).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Gets or sets the search term (searches name, email).
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Gets or sets the business ID filter.
    /// </summary>
    public Guid? BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the role filter.
    /// </summary>
    public string? Role { get; set; }

    /// <summary>
    /// Gets or sets the status filter (active, suspended).
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the sort field.
    /// </summary>
    public string? SortBy { get; set; }

    /// <summary>
    /// Gets or sets the sort direction (asc, desc).
    /// </summary>
    public string? SortDirection { get; set; }
}

