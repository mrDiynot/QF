using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a single message in a conversation.
/// </summary>
public class Message : BaseEntity
{
    /// <summary>
    /// Gets or sets the conversation ID this message belongs to.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the message direction (inbound or outbound).
    /// </summary>
    public MessageDirection Direction { get; set; }

    /// <summary>
    /// Gets or sets when the message was sent.
    /// </summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the message was delivered (if applicable).
    /// </summary>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was read (if applicable).
    /// </summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Gets or sets the parent message ID for threaded conversations.
    /// Null if this is a root-level message (not a reply).
    /// </summary>
    public Guid? ParentMessageId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this message was created via the simulator.
    /// Simulated messages are excluded from production analytics and can be purged separately.
    /// </summary>
    public bool IsSimulated { get; set; }

    /// <summary>
    /// Gets or sets the delivery status of the message (for outbound messages).
    /// Tracks the message through the delivery pipeline.
    /// </summary>
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Queued;

    /// <summary>
    /// Gets or sets the number of times delivery has been retried.
    /// Used for exponential backoff and max retry limit enforcement.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets when the last retry attempt was made.
    /// Used for calculating exponential backoff delays.
    /// </summary>
    public DateTime? LastRetryAt { get; set; }

    /// <summary>
    /// Gets or sets the reason for delivery failure if applicable.
    /// Contains error message from the messaging provider.
    /// </summary>
    public string? FailureReason { get; set; }

    /// <summary>
    /// Gets or sets the external message ID from the provider (e.g., Twilio SID).
    /// Used for tracking and correlating with provider webhooks.
    /// </summary>
    public string? ExternalMessageId { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the conversation this message belongs to.
    /// </summary>
    public Conversation Conversation { get; set; } = null!;

    /// <summary>
    /// Gets or sets the parent message if this is a reply in a thread.
    /// Null if this is a root-level message.
    /// </summary>
    public Message? ParentMessage { get; set; }

    /// <summary>
    /// Gets the collection of reply messages to this message.
    /// Empty if this message has no replies.
    /// </summary>
    public ICollection<Message> Replies { get; } = new List<Message>();

    /// <summary>
    /// Gets the collection of read statuses for this message (one per user who read it).
    /// </summary>
    public ICollection<MessageReadStatus> ReadStatuses { get; } = new List<MessageReadStatus>();

    /// <summary>
    /// Gets the collection of file attachments for this message.
    /// </summary>
    public ICollection<MessageAttachment> Attachments { get; } = new List<MessageAttachment>();

    /// <summary>
    /// Gets a value indicating whether this message is a reply to another message.
    /// </summary>
    public bool IsReply => ParentMessageId.HasValue;

    /// <summary>
    /// Gets a value indicating whether this message has attachments.
    /// </summary>
    public bool HasAttachments => Attachments.Count > 0;

    /// <summary>
    /// Gets a value indicating whether this message has any replies.
    /// </summary>
    public bool HasReplies => Replies.Count > 0;
}

