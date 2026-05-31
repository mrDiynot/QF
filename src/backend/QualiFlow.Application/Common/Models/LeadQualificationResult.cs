// -----------------------------------------------------------------------
// <copyright file="LeadQualificationResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of lead qualification analysis.
/// </summary>
public sealed record LeadQualificationResult
{
    /// <summary>Gets the overall qualification score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets a value indicating whether the lead is qualified based on threshold.</summary>
    public required bool IsQualified { get; init; }

    /// <summary>Gets individual criterion scores.</summary>
    public required IReadOnlyList<CriterionScore> CriterionScores { get; init; }

    /// <summary>Gets the AI's reasoning for the qualification decision.</summary>
    public required string Reasoning { get; init; }

    /// <summary>Gets suggested next actions for the sales team.</summary>
    public IReadOnlyList<string>? SuggestedActions { get; init; }

    /// <summary>Gets the confidence level of the qualification (0-1).</summary>
    public required float Confidence { get; init; }
}

