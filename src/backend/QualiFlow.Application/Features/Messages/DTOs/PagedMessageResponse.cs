namespace QualiFlow.Application.Features.Messages.DTOs;

/// <summary>
/// Paginated response containing a list of messages.
/// </summary>
public class PagedMessageResponse
{
    /// <summary>
    /// Gets or sets the list of messages for the current page.
    /// </summary>
    public IReadOnlyList<MessageResponse> Items { get; set; } = [];

    /// <summary>
    /// Gets or sets the current page number (1-based).
    /// </summary>
    /// <example>1.</example>
    public int Page { get; set; }

    /// <summary>
    /// Gets or sets the number of items per page.
    /// </summary>
    /// <example>10.</example>
    public int PageSize { get; set; }

    /// <summary>
    /// Gets or sets the total number of items across all pages.
    /// </summary>
    /// <example>100.</example>
    public int TotalItems { get; set; }

    /// <summary>
    /// Gets or sets the total number of pages.
    /// </summary>
    /// <example>10.</example>
    public int TotalPages { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether there is a next page.
    /// </summary>
    /// <example>true.</example>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether there is a previous page.
    /// </summary>
    /// <example>false.</example>
    public bool HasPreviousPage { get; set; }
}

