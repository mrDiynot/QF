// <copyright file="SentimentAnalyticsDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// DTO for sentiment analytics data.
/// </summary>
public record SentimentAnalyticsDto
{
    /// <summary>Gets the overall sentiment distribution.</summary>
    public SentimentDistribution Overall { get; init; } = new();

    /// <summary>Gets the sentiment trend over time.</summary>
    public IReadOnlyList<SentimentTrendPoint> Trend { get; init; } = [];

    /// <summary>Gets sentiment by channel.</summary>
    public IReadOnlyList<ChannelSentiment> ByChannel { get; init; } = [];

    /// <summary>Gets the average sentiment score (-1 to 1).</summary>
    public double AverageScore { get; init; }

    /// <summary>Gets the total messages analyzed.</summary>
    public int TotalMessagesAnalyzed { get; init; }

    /// <summary>Gets the date range start.</summary>
    public DateTime DateFrom { get; init; }

    /// <summary>Gets the date range end.</summary>
    public DateTime DateTo { get; init; }
}

/// <summary>
/// Sentiment distribution breakdown.
/// </summary>
public record SentimentDistribution
{
    /// <summary>Gets the count of positive messages.</summary>
    public int Positive { get; init; }

    /// <summary>Gets the count of neutral messages.</summary>
    public int Neutral { get; init; }

    /// <summary>Gets the count of negative messages.</summary>
    public int Negative { get; init; }

    /// <summary>Gets the percentage of positive messages.</summary>
    public double PositivePercent { get; init; }

    /// <summary>Gets the percentage of neutral messages.</summary>
    public double NeutralPercent { get; init; }

    /// <summary>Gets the percentage of negative messages.</summary>
    public double NegativePercent { get; init; }
}

/// <summary>
/// A point in the sentiment trend over time.
/// </summary>
public record SentimentTrendPoint
{
    /// <summary>Gets the date.</summary>
    public DateTime Date { get; init; }

    /// <summary>Gets the average sentiment score for this period.</summary>
    public double AverageScore { get; init; }

    /// <summary>Gets the count of positive messages.</summary>
    public int PositiveCount { get; init; }

    /// <summary>Gets the count of neutral messages.</summary>
    public int NeutralCount { get; init; }

    /// <summary>Gets the count of negative messages.</summary>
    public int NegativeCount { get; init; }

    /// <summary>Gets the total messages in this period.</summary>
    public int TotalCount { get; init; }
}

/// <summary>
/// Sentiment breakdown by channel.
/// </summary>
public record ChannelSentiment
{
    /// <summary>Gets the channel type.</summary>
    public string Channel { get; init; } = string.Empty;

    /// <summary>Gets the average sentiment score for this channel.</summary>
    public double AverageScore { get; init; }

    /// <summary>Gets the sentiment distribution for this channel.</summary>
    public SentimentDistribution Distribution { get; init; } = new();

    /// <summary>Gets the total messages for this channel.</summary>
    public int TotalMessages { get; init; }
}
