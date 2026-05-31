using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Domain.ValueObjects;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for managing business subscriptions and tier changes.
/// </summary>
public interface ISubscriptionService
{
    /// <summary>
    /// Gets all available subscription plans.
    /// </summary>
    /// <param name="includeInactive">Include inactive plans.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of subscription plans.</returns>
    Task<IReadOnlyList<SubscriptionPlan>> GetAllPlansAsync(bool includeInactive = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a subscription plan by ID with features.
    /// </summary>
    /// <param name="planId">The subscription plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The subscription plan or null if not found.</returns>
    Task<SubscriptionPlan?> GetPlanByIdAsync(Guid planId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets a subscription plan by slug/name.
    /// </summary>
    /// <param name="slug">The plan slug or name (e.g., "smart-flow", "ultra-flow").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The subscription plan or null if not found.</returns>
    Task<SubscriptionPlan?> GetPlanBySlugAsync(string slug, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the subscription for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The subscription or null if not found.</returns>
    Task<Subscription?> GetSubscriptionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the plan limits for a specific subscription plan.
    /// </summary>
    /// <param name="planId">The subscription plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dictionary of limit keys and values.</returns>
    Task<IReadOnlyDictionary<string, string>> GetPlanLimitsAsync(Guid planId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets the plan limits for a business (includes overrides).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dictionary of limit keys and values.</returns>
    Task<IReadOnlyDictionary<string, string>> GetBusinessLimitsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Upgrades a business subscription to a higher tier plan.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="targetPlanId">The target subscription plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> UpgradeSubscriptionAsync(Guid businessId, Guid targetPlanId, CancellationToken cancellationToken);

    /// <summary>
    /// Downgrades a business subscription to a lower tier plan (scheduled for next billing cycle).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="targetPlanId">The target subscription plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> DowngradeSubscriptionAsync(Guid businessId, Guid targetPlanId, CancellationToken cancellationToken);

    /// <summary>
    /// Cancels a business subscription (effective at end of billing period).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> CancelSubscriptionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Suspends a business subscription (payment failed, grace period).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> SuspendSubscriptionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Reactivates a suspended subscription after successful payment.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> ReactivateSubscriptionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Checks if a business subscription is active and not expired.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if active, false otherwise.</returns>
    Task<bool> IsSubscriptionActiveAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Checks if a business trial has expired.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if trial expired, false otherwise.</returns>
    Task<bool> IsTrialExpiredAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets all subscriptions across all businesses (admin only).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all subscriptions with business and plan details.</returns>
    Task<IReadOnlyList<SubscriptionWithDetailsDto>> GetAllSubscriptionsForAdminAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Gets a subscription by ID (admin only).
    /// </summary>
    /// <param name="subscriptionId">The subscription ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The subscription with details or null if not found.</returns>
    Task<SubscriptionWithDetailsDto?> GetSubscriptionByIdForAdminAsync(Guid subscriptionId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets subscription statistics for admin dashboard.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Subscription statistics including MRR, counts by status and plan.</returns>
    Task<SubscriptionStatsDto> GetSubscriptionStatsAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Changes a subscription plan (admin override).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="newPlanId">The new plan ID.</param>
    /// <param name="immediate">Whether to apply immediately or at next billing cycle.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated subscription.</returns>
    Task<Subscription> AdminChangePlanAsync(Guid businessId, Guid newPlanId, bool immediate, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a default FreeFlow subscription for a business that doesn't have one.
    /// This is used as a fallback for OAuth users who were created before subscription creation was added.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created subscription.</returns>
    Task<Subscription> CreateDefaultSubscriptionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Extends a business's trial period by the specified number of days.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="days">Number of days to extend the trial.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ExtendTrialAsync(Guid businessId, int days, CancellationToken cancellationToken);

    /// <summary>
    /// Applies a credit to a business's subscription account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="amount">The credit amount.</param>
    /// <param name="reason">The reason for the credit.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ApplyCreditAsync(Guid businessId, decimal amount, string reason, CancellationToken cancellationToken);
}

/// <summary>
/// DTO for subscription with business and plan details.
/// </summary>
public class SubscriptionWithDetailsDto
{
    /// <summary>Gets the subscription ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the business ID.</summary>
    public Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public string BusinessName { get; init; } = string.Empty;

    /// <summary>Gets the business email.</summary>
    public string BusinessEmail { get; init; } = string.Empty;

    /// <summary>Gets the plan ID.</summary>
    public Guid PlanId { get; init; }

    /// <summary>Gets the plan name.</summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>Gets the status.</summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>Gets the monthly price.</summary>
    public decimal MonthlyPrice { get; init; }

    /// <summary>Gets the MRR (alias for MonthlyPrice, for frontend compatibility).</summary>
    public decimal Mrr => MonthlyPrice;

    /// <summary>Gets the current period start.</summary>
    public DateTime? CurrentPeriodStart { get; init; }

    /// <summary>Gets the current period end.</summary>
    public DateTime? CurrentPeriodEnd { get; init; }

    /// <summary>Gets a value indicating whether the subscription cancels at period end.</summary>
    public bool CancelAtPeriodEnd { get; init; }

    /// <summary>Gets the trial end date.</summary>
    public DateTime? TrialEnd { get; init; }

    /// <summary>Gets the created date.</summary>
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// DTO for subscription statistics.
/// </summary>
public class SubscriptionStatsDto
{
    /// <summary>Gets the total subscriptions.</summary>
    public int TotalSubscriptions { get; init; }

    /// <summary>Gets the active subscriptions.</summary>
    public int ActiveSubscriptions { get; init; }

    /// <summary>Gets the trialing subscriptions.</summary>
    public int TrialingSubscriptions { get; init; }

    /// <summary>Gets the cancelled subscriptions.</summary>
    public int CancelledSubscriptions { get; init; }

    /// <summary>Gets the past due subscriptions.</summary>
    public int PastDueSubscriptions { get; init; }

    /// <summary>Gets the total MRR (Monthly Recurring Revenue) from active subscriptions.</summary>
    public decimal TotalMRR { get; init; }

    /// <summary>Gets the MRR alias for frontend compatibility.</summary>
    public decimal Mrr => TotalMRR;

    /// <summary>Gets the ARR (Annual Recurring Revenue) = MRR × 12.</summary>
    public decimal Arr => TotalMRR * 12;

    /// <summary>Gets the churn rate as a percentage (canceled / total active at start of month).</summary>
    public decimal ChurnRate { get; init; }

    /// <summary>Gets the average revenue per user (MRR / active subscriptions).</summary>
    public decimal AverageRevenuePerUser { get; init; }

    /// <summary>Gets the number of subscriptions canceled this month.</summary>
    public int CanceledThisMonth { get; init; }

    /// <summary>Gets the stats by plan.</summary>
    public IReadOnlyList<PlanSubscriptionStatsDto> ByPlan { get; init; } = [];
}

/// <summary>
/// DTO for plan-level subscription statistics.
/// </summary>
public class PlanSubscriptionStatsDto
{
    /// <summary>Gets the plan ID.</summary>
    public Guid PlanId { get; init; }

    /// <summary>Gets the plan name.</summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>Gets the count.</summary>
    public int Count { get; init; }

    /// <summary>Gets the MRR for this plan.</summary>
    public decimal Mrr { get; init; }

    /// <summary>Gets the percentage of total subscriptions.</summary>
    public decimal Percentage { get; init; }
}

