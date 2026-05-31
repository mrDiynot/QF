// -----------------------------------------------------------------------
// <copyright file="ReportGenerationRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Types of reports that can be generated.
/// </summary>
public enum ReportType
{
    /// <summary>Lead performance analysis with conversion metrics.</summary>
    LeadPerformance,

    /// <summary>Conversion funnel analysis across stages.</summary>
    ConversionAnalysis,

    /// <summary>Channel effectiveness comparison.</summary>
    ChannelEffectiveness,

    /// <summary>ROI summary with cost and revenue metrics.</summary>
    RoiSummary,

    /// <summary>AI usage and cost analysis.</summary>
    AiUsageAnalysis,

    /// <summary>Team performance metrics.</summary>
    TeamPerformance,

    /// <summary>Custom report based on specified metrics.</summary>
    Custom,
}

/// <summary>
/// Request to generate a business report using AI.
/// </summary>
public sealed record ReportGenerationRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the user ID requesting the report.</summary>
    public Guid? UserId { get; init; }

    /// <summary>Gets the type of report to generate.</summary>
    public required ReportType ReportType { get; init; }

    /// <summary>Gets the start date for the report period.</summary>
    public required DateTime DateFrom { get; init; }

    /// <summary>Gets the end date for the report period.</summary>
    public required DateTime DateTo { get; init; }

    /// <summary>Gets optional filters for the report (e.g., channel, status).</summary>
    public IReadOnlyDictionary<string, string>? Filters { get; init; }

    /// <summary>Gets optional custom metrics to include in the report.</summary>
    public IReadOnlyList<string>? CustomMetrics { get; init; }

    /// <summary>Gets a value indicating whether to include trend analysis.</summary>
    public bool IncludeTrends { get; init; } = true;

    /// <summary>Gets a value indicating whether to include AI-generated recommendations.</summary>
    public bool IncludeRecommendations { get; init; } = true;
}

