using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a business subscription with billing and tier information.
/// </summary>
public class Subscription : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan ID (database-driven).
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the plan version for grandfathering.
    /// When a plan is updated, existing subscriptions keep their original version.
    /// </summary>
    public required int PlanVersion { get; set; }

    /// <summary>
    /// Gets or sets the subscription status.
    /// </summary>
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;

    /// <summary>
    /// Gets or sets the Stripe customer ID.
    /// </summary>
    public string? StripeCustomerId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe subscription ID.
    /// </summary>
    public string? StripeSubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the Stripe price ID.
    /// </summary>
    public string? StripePriceId { get; set; }

    /// <summary>
    /// Gets or sets the billing cycle (monthly or annual).
    /// </summary>
    public string BillingCycle { get; set; } = "monthly";

    /// <summary>
    /// Gets or sets the current billing period start date.
    /// </summary>
    public DateTime? CurrentPeriodStart { get; set; }

    /// <summary>
    /// Gets or sets the current billing period end date.
    /// </summary>
    public DateTime? CurrentPeriodEnd { get; set; }

    /// <summary>
    /// Gets or sets the trial start date.
    /// </summary>
    public DateTime? TrialStart { get; set; }

    /// <summary>
    /// Gets or sets the trial end date.
    /// </summary>
    public DateTime? TrialEnd { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription will be cancelled at period end.
    /// </summary>
    public bool CancelAtPeriodEnd { get; set; }

    /// <summary>
    /// Gets or sets when the subscription was cancelled.
    /// </summary>
    public DateTime? CancelledAt { get; set; }

    /// <summary>
    /// Gets or sets the monthly subscription amount.
    /// </summary>
    public decimal MonthlyAmount { get; set; }

    /// <summary>
    /// Gets or sets the annual subscription amount.
    /// </summary>
    public decimal? AnnualAmount { get; set; }

    /// <summary>
    /// Gets or sets the currency code (e.g., USD, EUR).
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Gets or sets the scheduled plan ID for downgrades.
    /// </summary>
    public Guid? ScheduledPlanId { get; set; }

    /// <summary>
    /// Gets or sets the scheduled change date for downgrades.
    /// </summary>
    public DateTime? ScheduledChangeDate { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the subscription plan.
    /// </summary>
    public SubscriptionPlan Plan { get; set; } = null!;

    /// <summary>
    /// Gets or sets the scheduled plan for downgrades.
    /// </summary>
    public SubscriptionPlan? ScheduledPlan { get; set; }

    /// <summary>
    /// Gets or sets the business this subscription belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the billing transactions for this subscription.
    /// </summary>
    public ICollection<BillingTransaction> BillingTransactions { get; } = [];
}

