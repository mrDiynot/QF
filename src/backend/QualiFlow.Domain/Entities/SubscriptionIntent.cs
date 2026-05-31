using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a user's intent to subscribe to a plan.
/// This record is created BEFORE redirecting to Stripe payment to ensure
/// we can always track and reconcile what the user intended to purchase.
/// </summary>
public class SubscriptionIntent : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the intended subscription plan ID.
    /// </summary>
    public Guid IntendedPlanId { get; set; }

    /// <summary>
    /// Gets or sets the billing interval (monthly, quarterly, yearly).
    /// </summary>
    public string BillingInterval { get; set; } = "monthly";

    /// <summary>
    /// Gets or sets a value indicating whether onboarding assistance was included.
    /// </summary>
    public bool IncludeOnboarding { get; set; }

    /// <summary>
    /// Gets or sets the Stripe checkout session ID.
    /// This links the intent to the Stripe session for reconciliation.
    /// </summary>
    public string? StripeCheckoutSessionId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe customer ID (if known).
    /// </summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>
    /// Gets or sets the intent status.
    /// </summary>
    public SubscriptionIntentStatus Status { get; set; } = SubscriptionIntentStatus.Pending;

    /// <summary>
    /// Gets or sets when the intent was completed (subscription activated).
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the failure reason if the intent failed.
    /// </summary>
    public string? FailureReason { get; set; }

    /// <summary>
    /// Gets or sets when the intent expires (e.g., 24 hours after creation).
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the source of the intent (registration, upgrade, billing_page).
    /// </summary>
    public string Source { get; set; } = "registration";

    /// <summary>
    /// Gets or sets the user ID who created the intent (if known).
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Gets or sets the calculated amount in cents for auditing.
    /// </summary>
    public long? AmountCents { get; set; }

    /// <summary>
    /// Gets or sets the currency.
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// </summary>
    public string? MetadataJson { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the intended plan.
    /// </summary>
    public SubscriptionPlan IntendedPlan { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who created the intent.
    /// </summary>
    public ApplicationUser? User { get; set; }
}

