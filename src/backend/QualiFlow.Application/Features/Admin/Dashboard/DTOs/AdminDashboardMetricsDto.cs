namespace QualiFlow.Application.DTOs.Admin;

/// <summary>
/// Platform-wide dashboard metrics for administrators.
/// </summary>
public record AdminDashboardMetricsDto
{
    /// <summary>
    /// Gets the total number of businesses (tenants) on the platform.
    /// </summary>
    public int TotalBusinesses { get; init; }

    /// <summary>
    /// Gets the total number of users across all businesses.
    /// </summary>
    public int TotalUsers { get; init; }

    /// <summary>
    /// Gets the number of active subscriptions.
    /// </summary>
    public int ActiveSubscriptions { get; init; }

    /// <summary>
    /// Gets the Monthly Recurring Revenue in dollars.
    /// </summary>
    public decimal Mrr { get; init; }

    /// <summary>
    /// Gets the number of new signups in the last 7 days.
    /// </summary>
    public int NewSignups7d { get; init; }

    /// <summary>
    /// Gets the business growth percentage compared to previous period.
    /// </summary>
    public decimal BusinessGrowth { get; init; }

    /// <summary>
    /// Gets the user growth percentage compared to previous period.
    /// </summary>
    public decimal UserGrowth { get; init; }

    /// <summary>
    /// Gets the signup growth percentage compared to previous period.
    /// </summary>
    public decimal SignupGrowth { get; init; }

    /// <summary>
    /// Gets the subscription breakdown by plan.
    /// </summary>
    public IReadOnlyList<SubscriptionPlanMetricDto> SubscriptionsByPlan { get; init; } = [];

    /// <summary>
    /// Gets the recent platform activity.
    /// </summary>
    public IReadOnlyList<AdminActivityItemDto> RecentActivity { get; init; } = [];
}

/// <summary>
/// Subscription count by plan.
/// </summary>
public record SubscriptionPlanMetricDto
{
    /// <summary>
    /// Gets the plan name (e.g., "Free", "Pro", "Enterprise").
    /// </summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of subscriptions on this plan.
    /// </summary>
    public int Count { get; init; }

    /// <summary>
    /// Gets the monthly revenue from this plan.
    /// </summary>
    public decimal Revenue { get; init; }

    /// <summary>
    /// Gets the percentage of total subscriptions.
    /// </summary>
    public decimal Percentage { get; init; }
}

/// <summary>
/// Recent activity item for admin dashboard.
/// </summary>
public record AdminActivityItemDto
{
    /// <summary>
    /// Gets the activity ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the type of activity (e.g., "business_created", "user_signup", "subscription_upgraded").
    /// </summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Gets the human-readable description of the activity.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Gets the entity type involved (e.g., "Business", "User", "Subscription").
    /// </summary>
    public string EntityType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the entity ID involved.
    /// </summary>
    public Guid? EntityId { get; init; }

    /// <summary>
    /// Gets when the activity occurred.
    /// </summary>
    public DateTime Timestamp { get; init; }

    /// <summary>
    /// Gets the additional metadata about the activity.
    /// </summary>
    public IDictionary<string, object>? Metadata { get; init; }
}

