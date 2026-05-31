// -----------------------------------------------------------------------
// <copyright file="InsightsRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Categories of business insights.
/// </summary>
public enum InsightCategory
{
    /// <summary>Lead conversion and qualification patterns.</summary>
    ConversionTrends,

    /// <summary>Common objections and blockers.</summary>
    TopObjections,

    /// <summary>Channel performance comparison.</summary>
    ChannelPerformance,

    /// <summary>Lead qualification patterns and scoring.</summary>
    QualificationPatterns,

    /// <summary>Response time and engagement metrics.</summary>
    ResponseMetrics,

    /// <summary>Customer sentiment trends.</summary>
    SentimentTrends,

    /// <summary>Peak activity times and patterns.</summary>
    ActivityPatterns,

    /// <summary>Team performance metrics.</summary>
    TeamPerformance,
}

/// <summary>
/// Request for generating custom AI insights.
/// </summary>
public sealed record InsightsRequest
{
    /// <summary>Gets the start date for the analysis period.</summary>
    public DateTime? DateFrom { get; init; }

    /// <summary>Gets the end date for the analysis period.</summary>
    public DateTime? DateTo { get; init; }

    /// <summary>Gets the specific insight categories to analyze.</summary>
    public IReadOnlyList<InsightCategory>? Categories { get; init; }

    /// <summary>Gets the maximum number of insights to generate.</summary>
    public int MaxInsights { get; init; } = 5;

    /// <summary>Gets a value indicating whether to include trend analysis.</summary>
    public bool IncludeTrends { get; init; } = true;

    /// <summary>Gets a value indicating whether to include actionable recommendations.</summary>
    public bool IncludeRecommendations { get; init; } = true;
}

