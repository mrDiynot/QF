using QualiFlow.Application.DTOs.Admin;

namespace QualiFlow.Application.Interfaces.Admin;

/// <summary>
/// Service interface for admin dashboard operations.
/// </summary>
public interface IAdminDashboardService
{
    /// <summary>
    /// Gets platform-wide dashboard metrics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dashboard metrics including businesses, users, subscriptions, and MRR.</returns>
    Task<AdminDashboardMetricsDto> GetDashboardMetricsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent platform activity.
    /// </summary>
    /// <param name="limit">Maximum number of activities to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of recent platform activities.</returns>
    Task<IReadOnlyList<AdminActivityItemDto>> GetRecentActivityAsync(
        int limit = 20,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets subscription breakdown by plan.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Subscription counts grouped by plan.</returns>
    Task<IReadOnlyList<SubscriptionPlanMetricDto>> GetSubscriptionBreakdownAsync(
        CancellationToken cancellationToken = default);
}

