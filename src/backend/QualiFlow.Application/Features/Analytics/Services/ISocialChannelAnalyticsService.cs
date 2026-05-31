using QualiFlow.Application.Features.Analytics.DTOs;

namespace QualiFlow.Application.Features.Analytics.Services;

/// <summary>
/// Service for calculating analytics specific to social media channels (Instagram, Facebook, WhatsApp).
/// Provides detailed engagement, messaging, and conversion metrics for social platforms.
/// </summary>
public interface ISocialChannelAnalyticsService
{
    /// <summary>
    /// Gets comprehensive analytics for a specific social channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for analytics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed social channel analytics including messaging, engagement, and conversion metrics.</returns>
    Task<SocialChannelAnalyticsDto> GetChannelAnalyticsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets summary analytics across all social channels for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="dateRange">The date range for analytics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Aggregated analytics across all social channels with individual breakdowns.</returns>
    Task<SocialChannelsSummaryDto> GetSocialChannelsSummaryAsync(
        Guid businessId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets messaging metrics for a social channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Messaging metrics including inbound/outbound counts, delivery, and read rates.</returns>
    Task<SocialMessagingMetrics> GetMessagingMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets engagement metrics for a social channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Engagement metrics including response rates, sentiment, and conversation duration.</returns>
    Task<SocialEngagementMetrics> GetEngagementMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets AI performance metrics for a social channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI metrics including coverage rate, handoffs, and qualification success.</returns>
    Task<SocialAIMetrics> GetAIMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets response window compliance metrics for Meta channels (24-hour policy).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Response window metrics including compliance rate and at-risk conversations.</returns>
    Task<ResponseWindowMetrics> GetResponseWindowMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets conversion metrics for a social channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The date range for metrics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Conversion metrics including leads, qualifications, and bookings.</returns>
    Task<SocialConversionMetrics> GetConversionMetricsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets trend data comparing current period to previous period.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="dateRange">The current date range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Trend data showing percentage changes from previous period.</returns>
    Task<SocialTrends> GetTrendsAsync(
        Guid businessId,
        Guid channelId,
        DateRange dateRange,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets conversations that are at risk of exceeding the 24-hour response window.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelId">Optional channel ID to filter by specific channel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Count of conversations at risk and their IDs.</returns>
    Task<(int riskCount, IReadOnlyList<Guid> riskConversationIds)> GetAtRiskConversationsAsync(
        Guid businessId,
        Guid? channelId = null,
        CancellationToken cancellationToken = default);
}

