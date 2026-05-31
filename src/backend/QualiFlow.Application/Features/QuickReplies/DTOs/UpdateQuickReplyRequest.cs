namespace QualiFlow.Application.Features.QuickReplies.DTOs;

/// <summary>
/// Request DTO for updating a quick reply.
/// </summary>
public record UpdateQuickReplyRequest
{
    /// <summary>
    /// Gets the shortcut trigger (e.g., "/hello").
    /// </summary>
    public string? Shortcut { get; init; }

    /// <summary>
    /// Gets the quick reply title.
    /// </summary>
    public string? Title { get; init; }

    /// <summary>
    /// Gets the quick reply content.
    /// </summary>
    public string? Content { get; init; }

    /// <summary>
    /// Gets the category for grouping.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is a global quick reply.
    /// </summary>
    public bool? IsGlobal { get; init; }
}

