// -----------------------------------------------------------------------
// <copyright file="ReportGenerationResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.ObjectModel;

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of AI report generation.
/// </summary>
public sealed record ReportGenerationResult
{
    /// <summary>Gets a value indicating whether generation was successful.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether the usage limit was exceeded.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>Gets the report title.</summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>Gets the report type.</summary>
    public ReportType ReportType { get; init; }

    /// <summary>Gets the date range for the report.</summary>
    public ReportDateRange? DateRange { get; init; }

    /// <summary>Gets the executive summary.</summary>
    public string ExecutiveSummary { get; init; } = string.Empty;

    /// <summary>Gets the key insights from the report.</summary>
    public IReadOnlyList<ReportInsight> KeyInsights { get; init; } = [];

    /// <summary>Gets the report sections with data.</summary>
    public IReadOnlyList<ReportSection> Sections { get; init; } = [];

    /// <summary>Gets chart data for visualization.</summary>
    public IReadOnlyList<ChartData> Charts { get; init; } = [];

    /// <summary>Gets AI-generated recommendations.</summary>
    public IReadOnlyList<ReportRecommendation> Recommendations { get; init; } = [];

    /// <summary>Gets the AI generation audit ID.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets when the report was generated.</summary>
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="limitExceeded">Whether the limit was exceeded.</param>
    /// <returns>A failed report generation result.</returns>
    public static ReportGenerationResult Failed(string errorMessage, bool limitExceeded = false) =>
        new()
        {
            Success = false,
            ErrorMessage = errorMessage,
            LimitExceeded = limitExceeded,
        };
}

/// <summary>Report date range.</summary>
public sealed record ReportDateRange(DateTime From, DateTime To);

/// <summary>A key insight from the report.</summary>
public sealed record ReportInsight(string Title, string Description, string Icon, string Trend);

/// <summary>A metric within a report section.</summary>
public sealed record ReportMetric(string Name, string Value, string? Change, string? ChangeType);

/// <summary>A section of the report with metrics.</summary>
public sealed record ReportSection(string Title, string Description, IReadOnlyList<ReportMetric> Metrics);

/// <summary>A data point in a chart.</summary>
public sealed record ChartDataPoint(string Label, decimal Value);

/// <summary>Chart data for visualization.</summary>
public sealed record ChartData(string Title, string Type, IReadOnlyList<ChartDataPoint> Data);

/// <summary>An AI-generated recommendation.</summary>
public sealed record ReportRecommendation(string Title, string Description, string Priority, string Category);

