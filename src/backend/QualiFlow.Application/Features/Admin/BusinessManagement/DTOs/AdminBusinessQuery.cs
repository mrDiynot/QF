namespace QualiFlow.Application.Features.Admin.BusinessManagement.DTOs;

/// <summary>
/// Query parameters for filtering and paginating businesses.
/// </summary>
public class AdminBusinessQuery
{
    /// <summary>
    /// Gets or sets the search term (searches name, email, phone).
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Gets or sets the subscription tier filter.
    /// </summary>
    public string? SubscriptionTier { get; set; }

    /// <summary>
    /// Gets or sets the status filter (active/suspended).
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Gets or sets the page number (1-based).
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; set; } = 10;
}

