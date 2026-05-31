namespace QualiFlow.Application.Features.Forms.DTOs;

/// <summary>
/// Response DTO for paginated form list.
/// </summary>
public record PagedFormResponse
{
    /// <summary>
    /// Gets the list of forms.
    /// </summary>
    public required IReadOnlyList<FormResponse> Items { get; init; }

    /// <summary>
    /// Gets the current page number (1-based).
    /// </summary>
    public required int Page { get; init; }

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public required int PageSize { get; init; }

    /// <summary>
    /// Gets the total number of items.
    /// </summary>
    public required int TotalItems { get; init; }

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

