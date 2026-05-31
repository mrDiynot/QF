namespace QualiFlow.Application.Features.RealTime.DTOs;

/// <summary>
/// Event DTO for broadcasting new messages in real-time.
/// </summary>
public class NewMessageEvent
{
    /// <summary>
    /// Gets or sets the message ID.
    /// </summary>
    public Guid MessageId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the message direction (Inbound/Outbound).
    /// </summary>
    public string Direction { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the sender email.
    /// </summary>
    public string? SenderEmail { get; set; }

    /// <summary>
    /// Gets or sets when the message was sent.
    /// </summary>
    public DateTime SentAt { get; set; }
}

