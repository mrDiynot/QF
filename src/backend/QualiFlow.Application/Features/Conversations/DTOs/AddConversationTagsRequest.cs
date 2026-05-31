namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Request DTO for adding tags to a conversation.
/// </summary>
public class AddConversationTagsRequest
{
    /// <summary>
    /// Gets or sets the tags to add.
    /// </summary>
    /// <example>["urgent", "vip"].</example>
    public required IReadOnlyList<string> Tags { get; set; }
}

/// <summary>
/// Request DTO for removing tags from a conversation.
/// </summary>
public class RemoveConversationTagsRequest
{
    /// <summary>
    /// Gets or sets the tags to remove.
    /// </summary>
    /// <example>["urgent"].</example>
    public required IReadOnlyList<string> Tags { get; set; }
}

/// <summary>
/// Response DTO for conversation tags.
/// </summary>
public class ConversationTagsResponse
{
    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the current tags.
    /// </summary>
    public required IReadOnlyList<string> Tags { get; set; }

    /// <summary>
    /// Gets or sets when the tags were last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for available tag suggestions.
/// </summary>
public class TagSuggestionDto
{
    /// <summary>
    /// Gets or sets the tag name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the usage count across conversations.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets the tag color (optional).
    /// </summary>
    public string? Color { get; set; }
}

