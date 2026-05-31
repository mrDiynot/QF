using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a deal (sales opportunity) in QualiFlow's built-in CRM pipeline.
/// </summary>
public class Deal : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the contact ID associated with this deal.
    /// </summary>
    public Guid ContactId { get; set; }

    // ============================================================================
    // Deal Information
    // ============================================================================

    /// <summary>
    /// Gets or sets the deal title/name.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the deal value/amount in currency.
    /// </summary>
    public decimal Value { get; set; }

    /// <summary>
    /// Gets or sets the probability of winning this deal (0-100%).
    /// </summary>
    public int Probability { get; set; } = 50;

    /// <summary>
    /// Gets or sets the current stage of this deal in the pipeline.
    /// </summary>
    public DealStage Stage { get; set; } = DealStage.New;

    // ============================================================================
    // Timeline
    // ============================================================================

    /// <summary>
    /// Gets or sets the expected close date for this deal.
    /// </summary>
    public DateTime? ExpectedCloseDate { get; set; }

    /// <summary>
    /// Gets or sets the actual close date when the deal was won or lost.
    /// </summary>
    public DateTime? ActualCloseDate { get; set; }

    // ============================================================================
    // Owner & Notes
    // ============================================================================

    /// <summary>
    /// Gets or sets the user ID who owns/manages this deal.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets the deal description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets internal notes about this deal.
    /// </summary>
    public string? Notes { get; set; }

    // ============================================================================
    // Win/Loss Tracking
    // ============================================================================

    /// <summary>
    /// Gets or sets the reason for losing this deal (if lost).
    /// Examples: "Price", "Competitor", "Timing", "Not Ready".
    /// </summary>
    public string? LossReason { get; set; }

    // ============================================================================
    // External CRM Integration (for external CRM adapters)
    // ============================================================================

    /// <summary>
    /// Gets or sets the external CRM deal/opportunity ID.
    /// </summary>
    public string? ExternalCRMId { get; set; }

    /// <summary>
    /// Gets or sets the external CRM deal/opportunity URL.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database for simplicity and compatibility")]
    public string? ExternalCRMUrl { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business this deal belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the contact associated with this deal.
    /// </summary>
    public Contact Contact { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user assigned to this deal.
    /// </summary>
    public ApplicationUser? AssignedToUser { get; set; }

    // ============================================================================
    // Computed Properties
    // ============================================================================

    /// <summary>
    /// Gets a value indicating whether this deal is won.
    /// </summary>
    public bool IsWon => Stage == DealStage.Won;

    /// <summary>
    /// Gets a value indicating whether this deal is lost.
    /// </summary>
    public bool IsLost => Stage == DealStage.Lost;

    /// <summary>
    /// Gets a value indicating whether this deal is closed (won or lost).
    /// </summary>
    public bool IsClosed => IsWon || IsLost;

    /// <summary>
    /// Gets a value indicating whether this deal is open (not closed).
    /// </summary>
    public bool IsOpen => !IsClosed;

    /// <summary>
    /// Gets the weighted value of this deal (Value * Probability / 100).
    /// For won deals, returns full value. For lost deals, returns 0.
    /// </summary>
    public decimal WeightedValue
    {
        get
        {
            if (IsWon)
            {
                return Value;
            }

            if (IsLost)
            {
                return 0;
            }

            return Value * (Probability / 100m);
        }
    }
}
