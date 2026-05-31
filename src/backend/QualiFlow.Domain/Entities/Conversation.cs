using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a conversation thread with a lead across a specific channel.
/// </summary>
public class Conversation : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID this conversation belongs to.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the communication channel for this conversation.
    /// </summary>
    public string Channel { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the channel ID (foreign key to Channel entity).
    /// Null for legacy conversations created before Sprint 5.
    /// </summary>
    public Guid? ChannelId { get; set; }

    /// <summary>
    /// Gets or sets the conversation status.
    /// </summary>
    public ConversationStatus Status { get; set; } = ConversationStatus.Open;

    /// <summary>
    /// Gets or sets when the conversation started.
    /// </summary>
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the conversation ended (if closed).
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the assigned agent's user ID.
    /// Null if unassigned.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets when the conversation was assigned.
    /// </summary>
    public DateTime? AssignedAt { get; set; }

    /// <summary>
    /// Gets or sets the priority level (1-5, where 1 is highest).
    /// </summary>
    public int Priority { get; set; } = 3;

    /// <summary>
    /// Gets or sets the conversation tags (comma-separated).
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this conversation was created via the simulator.
    /// Simulated conversations are excluded from production analytics and can be purged separately.
    /// </summary>
    public bool IsSimulated { get; set; }

    /// <summary>
    /// Gets or sets the external participant ID for third-party messaging platforms.
    /// For Meta (Facebook/Instagram): This is the PSID (Page-Scoped ID) or IGSID (Instagram-Scoped ID).
    /// Used to send outbound messages to the correct recipient.
    /// </summary>
    public string? ExternalParticipantId { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this conversation belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead this conversation is with.
    /// </summary>
    public Lead Lead { get; set; } = null!;

    /// <summary>
    /// Gets or sets the assigned agent.
    /// </summary>
    public ApplicationUser? AssignedToUser { get; set; }

    /// <summary>
    /// Gets or sets the channel this conversation is conducted through.
    /// </summary>
    public Channel? ChannelEntity { get; set; }

    /// <summary>
    /// Gets the messages in this conversation.
    /// </summary>
    public ICollection<Message> Messages { get; } = [];

    /// <summary>
    /// Gets the internal notes for this conversation.
    /// </summary>
    public ICollection<ConversationNote> Notes { get; } = [];
}

