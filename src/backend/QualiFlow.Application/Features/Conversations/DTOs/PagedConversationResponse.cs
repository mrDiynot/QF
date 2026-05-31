namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Paginated response wrapper for conversation lists.
/// </summary>
public class PagedConversationResponse
{
    /// <summary>
    /// Gets or sets the list of conversations for the current page.
    /// </summary>
    public required IReadOnlyList<ConversationResponse> Items { get; set; }

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

    /// <summary>
    /// Gets or sets the total number of active conversations (status = Open or InProgress).
    /// </summary>
    /// <example>15.</example>
    public int TotalActive { get; set; }

    /// <summary>
    /// Gets or sets the total number of closed conversations (status = Closed or Archived).
    /// </summary>
    /// <example>35.</example>
    public int TotalClosed { get; set; }

    /// <summary>
    /// Gets or sets the total unread message count across all conversations.
    /// </summary>
    /// <example>8.</example>
    public int TotalUnreadCount { get; set; }
}

