// -----------------------------------------------------------------------
// <copyright file="AIUsageMetrics.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// AI usage metrics for a business within a date range.
/// </summary>
public sealed record AIUsageMetrics
{
    /// <summary>Gets the business ID these metrics are for.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the start date of the metrics period.</summary>
    public required DateTime StartDate { get; init; }

    /// <summary>Gets the end date of the metrics period.</summary>
    public required DateTime EndDate { get; init; }

    /// <summary>Gets the total number of qualification requests.</summary>
    public required int TotalQualifications { get; init; }

    /// <summary>Gets the total number of conversation analyses.</summary>
    public required int TotalAnalyses { get; init; }

    /// <summary>Gets the total number of suggested responses generated.</summary>
    public required int TotalSuggestions { get; init; }

    /// <summary>Gets the total tokens used (input + output).</summary>
    public required int TotalTokensUsed { get; init; }

    /// <summary>Gets the breakdown of input tokens.</summary>
    public required int InputTokens { get; init; }

    /// <summary>Gets the breakdown of output tokens.</summary>
    public required int OutputTokens { get; init; }

    /// <summary>Gets the estimated cost in USD.</summary>
    public required decimal EstimatedCostUsd { get; init; }

    /// <summary>Gets the average latency in milliseconds.</summary>
    public required double AverageLatencyMs { get; init; }

    /// <summary>Gets the success rate (0-1).</summary>
    public required float SuccessRate { get; init; }
}

