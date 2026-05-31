using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Request DTO for updating an existing conversation.
/// All properties are optional - only provided properties will be updated.
/// </summary>
public class UpdateConversationRequest
{
    /// <summary>
    /// Gets or sets the conversation status.
    /// </summary>
    /// <example>Closed.</example>
    public ConversationStatus? Status { get; set; }

    /// <summary>
    /// Gets or sets when the conversation ended (for closing conversations).
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the conversation tags.
    /// </summary>
    /// <example>["urgent", "vip", "follow-up"].</example>
    public IReadOnlyList<string>? Tags { get; set; }

    /// <summary>
    /// Gets or sets the priority level (1-5, where 1 is highest).
    /// </summary>
    /// <example>3.</example>
    public int? Priority { get; set; }

    /// <summary>
    /// Gets or sets the assigned agent's user ID.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }
}

