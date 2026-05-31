using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Messages.DTOs;

/// <summary>
/// Response DTO for message data.
/// </summary>
public class MessageResponse
{
    /// <summary>
    /// Gets or sets the message ID.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID this message belongs to.
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    /// <example>Hello, I'm interested in your product.</example>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the message direction (Inbound or Outbound).
    /// </summary>
    /// <example>Inbound.</example>
    public MessageDirection Direction { get; set; }

    /// <summary>
    /// Gets or sets when the message was sent.
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public DateTime SentAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was delivered (if applicable).
    /// </summary>
    /// <example>2025-12-03T15:30:05Z.</example>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was read (if applicable).
    /// </summary>
    /// <example>2025-12-03T15:35:00Z.</example>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was created.
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was last updated.
    /// </summary>
    /// <example>2025-12-03T15:35:00Z.</example>
    public DateTime? UpdatedAt { get; set; }
}

