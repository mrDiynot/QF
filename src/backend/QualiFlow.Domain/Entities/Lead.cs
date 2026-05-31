using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a lead captured from various channels.
/// </summary>
public class Lead : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead's name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the lead's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the lead's phone number.
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Gets or sets the lead's current status in the qualification pipeline.
    /// </summary>
    public LeadStatus Status { get; set; } = LeadStatus.New;

    /// <summary>
    /// Gets or sets the lead's qualification score (0-100).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Gets or sets the Budget score from BANT qualification (0-100).
    /// </summary>
    public int? BudgetScore { get; set; }

    /// <summary>
    /// Gets or sets the Authority score from BANT qualification (0-100).
    /// </summary>
    public int? AuthorityScore { get; set; }

    /// <summary>
    /// Gets or sets the Need score from BANT qualification (0-100).
    /// </summary>
    public int? NeedScore { get; set; }

    /// <summary>
    /// Gets or sets the Timeline score from BANT qualification (0-100).
    /// </summary>
    public int? TimelineScore { get; set; }

    /// <summary>
    /// Gets or sets the source channel where the lead was captured.
    /// </summary>
    public string SourceChannel { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the assigned user ID (sales agent).
    /// Null if unassigned.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets when the lead was assigned.
    /// </summary>
    public DateTime? AssignedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this lead was created via the simulator.
    /// Simulated leads are excluded from production analytics and can be purged separately.
    /// </summary>
    public bool IsSimulated { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this lead belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the assigned user (sales agent).
    /// </summary>
    public ApplicationUser? AssignedToUser { get; set; }

    /// <summary>
    /// Gets the conversations associated with this lead.
    /// </summary>
    public ICollection<Conversation> Conversations { get; } = [];

    /// <summary>
    /// Gets the qualifications associated with this lead.
    /// </summary>
    public ICollection<Qualification> Qualifications { get; } = [];

    /// <summary>
    /// Gets the bookings associated with this lead.
    /// </summary>
    public ICollection<Booking> Bookings { get; } = [];

    /// <summary>
    /// Gets the score history records for this lead.
    /// </summary>
    public ICollection<ScoreHistory> ScoreHistories { get; } = [];

    /// <summary>
    /// Gets the outbound calls made to this lead.
    /// </summary>
    public ICollection<OutboundCall> OutboundCalls { get; } = [];

    /// <summary>
    /// Gets the form submissions that created this lead.
    /// </summary>
    public ICollection<FormSubmission> FormSubmissions { get; } = [];
}

