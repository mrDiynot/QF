using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents the read status of a message for a specific user.
/// Supports multi-user read tracking (e.g., team members viewing the same conversation).
/// </summary>
public class MessageReadStatus : BaseEntity
{
    /// <summary>
    /// Gets or sets the message ID.
    /// </summary>
    public Guid MessageId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who read the message.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets when the message was read by this user.
    /// </summary>
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;

    // Navigation properties

    /// <summary>
    /// Gets or sets the message that was read.
    /// </summary>
    public Message Message { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who read the message.
    /// </summary>
    public ApplicationUser User { get; set; } = null!;
}

