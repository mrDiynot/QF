// -----------------------------------------------------------------------
// <copyright file="InsightsResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.ObjectModel;

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Severity levels for insights.
/// </summary>
public enum InsightSeverity
{
    /// <summary>Informational insight.</summary>
    Info,

    /// <summary>Positive insight (good performance).</summary>
    Positive,

    /// <summary>Warning that needs attention.</summary>
    Warning,

    /// <summary>Critical issue requiring immediate action.</summary>
    Critical,
}

/// <summary>
/// Result containing AI-generated business insights.
/// </summary>
public sealed record InsightsResult
{
    /// <summary>Gets a value indicating whether the insight generation was successful.</summary>
    public bool Success { get; init; }

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether the failure was due to usage limits.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>Gets the list of generated insights.</summary>
    public IReadOnlyList<InsightItem> Insights { get; init; } = [];

    /// <summary>Gets the summary metrics for the analysis period.</summary>
    public InsightsSummaryMetrics? Summary { get; init; }

    /// <summary>Gets trend data for week-over-week comparison.</summary>
    public InsightsTrendData? Trends { get; init; }

    /// <summary>Gets the audit ID for feedback tracking.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the generation timestamp.</summary>
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;

    /// <summary>Gets the cache expiration time.</summary>
    public DateTime? CacheExpiresAt { get; init; }
}

/// <summary>
/// Individual insight item.
/// </summary>
public sealed record InsightItem
{
    /// <summary>Gets the insight category.</summary>
    public InsightCategory Category { get; init; }

    /// <summary>Gets the insight title.</summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>Gets the detailed insight description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets the severity level (info, warning, critical, positive).</summary>
    public InsightSeverity Severity { get; init; }

    /// <summary>Gets the icon name suggestion for UI.</summary>
    public string? Icon { get; init; }

    /// <summary>Gets the primary metric value if applicable.</summary>
    public string? MetricValue { get; init; }

    /// <summary>Gets the metric change percentage if applicable.</summary>
    public decimal? MetricChange { get; init; }

    /// <summary>Gets the actionable recommendation.</summary>
    public string? Recommendation { get; init; }

    /// <summary>Gets the link to related page in the app.</summary>
    public string? ActionLink { get; init; }
}

/// <summary>
/// Summary metrics for the insights analysis period.
/// </summary>
public sealed record InsightsSummaryMetrics
{
    /// <summary>Gets the analysis period start date.</summary>
    public DateTime PeriodStart { get; init; }

    /// <summary>Gets the analysis period end date.</summary>
    public DateTime PeriodEnd { get; init; }

    /// <summary>Gets the total number of leads in the period.</summary>
    public int TotalLeads { get; init; }

    /// <summary>Gets the total number of conversations in the period.</summary>
    public int TotalConversations { get; init; }

    /// <summary>Gets the conversion rate percentage.</summary>
    public decimal ConversionRate { get; init; }

    /// <summary>Gets the average lead score.</summary>
    public decimal AverageLeadScore { get; init; }

    /// <summary>Gets the average response time in minutes.</summary>
    public decimal AverageResponseTimeMinutes { get; init; }

    /// <summary>Gets the top performing channel.</summary>
    public string? TopChannel { get; init; }
}

/// <summary>
/// Trend data for week-over-week comparison.
/// </summary>
public sealed record InsightsTrendData
{
    /// <summary>Gets the lead count change percentage.</summary>
    public decimal LeadCountChange { get; init; }

    /// <summary>Gets the conversion rate change.</summary>
    public decimal ConversionRateChange { get; init; }

    /// <summary>Gets the average score change.</summary>
    public decimal AverageScoreChange { get; init; }

    /// <summary>Gets the response time change.</summary>
    public decimal ResponseTimeChange { get; init; }

    /// <summary>Gets detected anomalies.</summary>
    public IReadOnlyList<AnomalyDetection> Anomalies { get; init; } = [];
}

/// <summary>
/// Detected anomaly in the data.
/// </summary>
public sealed record AnomalyDetection
{
    /// <summary>Gets the metric name.</summary>
    public string Metric { get; init; } = string.Empty;

    /// <summary>Gets the anomaly description.</summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>Gets a value indicating whether this is an unusual spike or drop.</summary>
    public bool IsSpike { get; init; }

    /// <summary>Gets the deviation percentage from normal.</summary>
    public decimal DeviationPercent { get; init; }
}

