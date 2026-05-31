using System.Text.Json.Serialization;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Performance metrics for a specific channel.
/// </summary>
public record ChannelPerformanceDto
{
    /// <summary>
    /// Gets the channel type (SMS, Voice, WhatsApp, etc.).
    /// </summary>
    public ChannelType ChannelType { get; init; }

    /// <summary>
    /// Gets the channel name.
    /// </summary>
    public string ChannelName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of conversations initiated through this channel.
    /// </summary>
    public int TotalConversations { get; init; }

    /// <summary>
    /// Gets the number of leads captured through this channel.
    /// </summary>
    public int TotalLeads { get; init; }

    /// <summary>
    /// Gets the number of messages sent/received through this channel.
    /// </summary>
    public int TotalMessages { get; init; }

    /// <summary>
    /// Gets the average response time for this channel (internal TimeSpan).
    /// </summary>
    [JsonIgnore]
    public TimeSpan AverageResponseTimeSpan { get; init; }

    /// <summary>
    /// Gets the average response time in seconds (for JSON serialization).
    /// </summary>
    public double AverageResponseTime => AverageResponseTimeSpan.TotalSeconds;

    /// <summary>
    /// Gets the conversion rate for leads from this channel (percentage).
    /// </summary>
    public decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the number of qualified leads from this channel.
    /// </summary>
    public int QualifiedLeads { get; init; }

    /// <summary>
    /// Gets the date range for these metrics.
    /// </summary>
    public DateRange Period { get; init; } = null!;
}
