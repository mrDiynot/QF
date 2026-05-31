using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Response DTO for conversation data.
/// </summary>
public class ConversationResponse
{
    /// <summary>
    /// Gets or sets the conversation's unique identifier.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant ID).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID this conversation belongs to.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the communication channel for this conversation.
    /// </summary>
    /// <example>chat_widget.</example>
    public required string Channel { get; set; }

    /// <summary>
    /// Gets or sets the conversation status.
    /// </summary>
    /// <example>Open.</example>
    public required ConversationStatus Status { get; set; }

    /// <summary>
    /// Gets or sets when the conversation started.
    /// </summary>
    /// <example>2025-12-03T14:30:00Z.</example>
    public required DateTime StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the conversation ended (if closed).
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets when the conversation was created.
    /// </summary>
    /// <example>2025-12-03T14:30:00Z.</example>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the conversation was last updated.
    /// </summary>
    /// <example>2025-12-03T15:00:00Z.</example>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the number of messages in this conversation.
    /// </summary>
    /// <example>5.</example>
    public int MessageCount { get; set; }

    /// <summary>
    /// Gets or sets the conversation tags.
    /// </summary>
    /// <example>["urgent", "vip", "follow-up"].</example>
    public IReadOnlyList<string> Tags { get; set; } = [];

    /// <summary>
    /// Gets or sets the priority level (1-5, where 1 is highest).
    /// </summary>
    /// <example>3.</example>
    public int Priority { get; set; } = 3;

    /// <summary>
    /// Gets or sets the assigned agent's user ID.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets the number of unread messages in this conversation.
    /// </summary>
    /// <example>3.</example>
    public int UnreadCount { get; set; }
}

