using QualiFlow.Application.Features.Analytics.DTOs;

namespace QualiFlow.Application.Features.Analytics.Services;

/// <summary>
/// Service for calculating analytics and business intelligence metrics.
/// </summary>
public interface IAnalyticsService
{
    /// <summary>
    /// Gets dashboard metrics for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dashboard metrics including leads, conversations, and conversion rates.</returns>
    Task<DashboardMetricsDto> GetDashboardMetricsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets conversion funnel metrics showing lead progression through stages.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Conversion funnel metrics from leads to customers.</returns>
    Task<ConversionFunnelDto> GetConversionFunnelAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets performance metrics for all channels.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Array of channel performance metrics.</returns>
    Task<ChannelPerformanceDto[]> GetChannelPerformanceAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates return on investment for campaigns.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="campaignId">Optional campaign ID to filter by specific campaign.</param>
    /// <param name="dateRange">The date range for ROI calculation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>ROI percentage.</returns>
    Task<decimal> CalculateROIAsync(
        Guid businessId,
        Guid? campaignId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets lead source attribution analytics showing performance by source channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Array of lead source attribution metrics.</returns>
    Task<LeadSourceAttributionDto[]> GetLeadSourceAttributionAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets conversion funnel metrics broken down by channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Array of conversion funnel metrics by channel.</returns>
    Task<ConversionFunnelByChannelDto[]> GetConversionFunnelByChannelAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets time-to-conversion metrics showing average time through sales stages.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Time-to-conversion metrics.</returns>
    Task<TimeToConversionDto> GetTimeToConversionMetricsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets agent performance metrics showing individual agent statistics.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Array of agent performance metrics.</returns>
    Task<AgentPerformanceDto[]> GetAgentPerformanceAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets revenue forecast based on pipeline and historical data.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="forecastPeriod">The period to forecast (e.g., "Q1 2026", "January 2026").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Revenue forecast metrics.</returns>
    Task<RevenueForecastDto> GetRevenueForecastAsync(
        Guid businessId,
        string forecastPeriod,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets sentiment analytics for messages within a date range.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for analytics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Sentiment analytics including distribution, trends, and channel breakdown.</returns>
    Task<SentimentAnalyticsDto> GetSentimentAnalyticsAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets health insights for a specific channel including health score, metrics, and AI recommendations.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The channel ID.</param>
    /// <param name="dateRange">The date range for metrics (defaults to last 30 days).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Channel health insights including health score and recommendations.</returns>
    Task<ChannelHealthDto> GetChannelHealthAsync(
        Guid businessId,
        Guid channelId,
        DateRange? dateRange = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets health summary for all channels including overall health score and insights per channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for metrics (defaults to last 30 days).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Channel health summary across all channels.</returns>
    Task<ChannelHealthSummaryDto> GetChannelHealthSummaryAsync(
        Guid businessId,
        DateRange? dateRange = null,
        CancellationToken cancellationToken = default);
}
