namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Channel health status.
/// </summary>
public enum ChannelHealthStatus
{
    /// <summary>
    /// Channel is operating optimally.
    /// </summary>
    Healthy,

    /// <summary>
    /// Channel has minor issues that need attention.
    /// </summary>
    Warning,

    /// <summary>
    /// Channel has critical issues requiring immediate action.
    /// </summary>
    Critical
}

/// <summary>
/// Health and performance insights for a specific channel.
/// Includes health score, status, metrics, and AI-powered recommendations.
/// </summary>
public record ChannelHealthDto
{
    /// <summary>
    /// Gets the channel ID.
    /// </summary>
    public Guid ChannelId { get; init; }

    /// <summary>
    /// Gets the channel type (SMS, Voice, WhatsApp, etc.).
    /// </summary>
    public string ChannelType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the overall health score (0-100).
    /// Higher score indicates better channel performance and setup.
    /// </summary>
    public int HealthScore { get; init; }

    /// <summary>
    /// Gets the health status.
    /// </summary>
    public ChannelHealthStatus Status { get; init; }

    /// <summary>
    /// Gets the performance metrics for this channel.
    /// </summary>
    public ChannelMetrics Metrics { get; init; } = null!;

    /// <summary>
    /// Gets AI-powered recommendations to improve channel performance.
    /// </summary>
    public IReadOnlyList<RecommendationDto> Recommendations { get; init; } = Array.Empty<RecommendationDto>();

    /// <summary>
    /// Gets the performance trends (change over time).
    /// </summary>
    public ChannelTrends Trends { get; init; } = null!;
}

/// <summary>
/// Performance metrics for a channel.
/// </summary>
public record ChannelMetrics
{
    /// <summary>
    /// Gets the total number of messages sent/received.
    /// </summary>
    public int TotalMessages { get; init; }

    /// <summary>
    /// Gets the response rate (0-1, where 1 = 100%).
    /// </summary>
    public decimal ResponseRate { get; init; }

    /// <summary>
    /// Gets the average response time in seconds.
    /// </summary>
    public int AvgResponseTime { get; init; }

    /// <summary>
    /// Gets the conversion rate (0-1, where 1 = 100%).
    /// </summary>
    public decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the number of active conversations.
    /// </summary>
    public int ActiveConversations { get; init; }
}

/// <summary>
/// Performance trends showing change over time.
/// </summary>
public record ChannelTrends
{
    /// <summary>
    /// Gets the percentage change in messages (e.g., 0.15 = +15%).
    /// </summary>
    public decimal MessagesChange { get; init; }

    /// <summary>
    /// Gets the percentage change in response rate.
    /// </summary>
    public decimal ResponseRateChange { get; init; }

    /// <summary>
    /// Gets the percentage change in conversion rate.
    /// </summary>
    public decimal ConversionChange { get; init; }
}

/// <summary>
/// Summary of health status across all channels.
/// </summary>
public record ChannelHealthSummaryDto
{
    /// <summary>
    /// Gets the overall health score across all channels (0-100).
    /// </summary>
    public int OverallScore { get; init; }

    /// <summary>
    /// Gets the total number of channels.
    /// </summary>
    public int TotalChannels { get; init; }

    /// <summary>
    /// Gets the number of active channels.
    /// </summary>
    public int ActiveChannels { get; init; }

    /// <summary>
    /// Gets the number of channels needing attention (warning or critical status).
    /// </summary>
    public int ChannelsNeedingAttention { get; init; }

    /// <summary>
    /// Gets health insights for all channels.
    /// </summary>
    public IReadOnlyList<ChannelHealthDto> Insights { get; init; } = Array.Empty<ChannelHealthDto>();
}
