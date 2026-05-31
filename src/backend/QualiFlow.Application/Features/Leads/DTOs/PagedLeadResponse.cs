namespace QualiFlow.Application.Features.Leads.DTOs;

/// <summary>
/// Paginated response DTO for lead lists.
/// </summary>
public class PagedLeadResponse
{
    /// <summary>
    /// Gets or sets the list of leads for the current page.
    /// </summary>
    public required IReadOnlyList<LeadResponse> Items { get; set; }

    /// <summary>
    /// Gets or sets the current page number (1-based).
    /// </summary>
    /// <example>1.</example>
    public required int Page { get; set; }

    /// <summary>
    /// Gets or sets the number of items per page.
    /// </summary>
    /// <example>10.</example>
    public required int PageSize { get; set; }

    /// <summary>
    /// Gets or sets the total number of items across all pages.
    /// </summary>
    /// <example>50.</example>
    public required int TotalItems { get; set; }

    /// <summary>
    /// Gets or sets the total number of pages.
    /// </summary>
    /// <example>5.</example>
    public required int TotalPages { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether there is a next page.
    /// </summary>
    /// <example>true.</example>
    public required bool HasNextPage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether there is a previous page.
    /// </summary>
    /// <example>false.</example>
    public required bool HasPreviousPage { get; set; }
}

