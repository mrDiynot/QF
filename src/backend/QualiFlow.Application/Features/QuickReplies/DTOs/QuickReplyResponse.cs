namespace QualiFlow.Application.Features.QuickReplies.DTOs;

/// <summary>
/// Response DTO for quick reply.
/// </summary>
public record QuickReplyResponse
{
    /// <summary>
    /// Gets the quick reply ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the shortcut trigger (e.g., "/hello").
    /// </summary>
    public string Shortcut { get; init; } = string.Empty;

    /// <summary>
    /// Gets the quick reply title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the quick reply content.
    /// </summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>
    /// Gets the category for grouping.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is a global quick reply.
    /// </summary>
    public bool IsGlobal { get; init; }

    /// <summary>
    /// Gets the usage count.
    /// </summary>
    public int UsageCount { get; init; }

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}

