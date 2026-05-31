// -----------------------------------------------------------------------
// <copyright file="LeadScoreResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Result of lead scoring calculation.
/// </summary>
public sealed record LeadScoreResult
{
    /// <summary>Gets the lead ID that was scored.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the final normalized score (0-100).</summary>
    public required int FinalScore { get; init; }

    /// <summary>Gets the previous score before this calculation.</summary>
    public int? PreviousScore { get; init; }

    /// <summary>Gets the change in score.</summary>
    public int ScoreChange { get; init; }

    /// <summary>Gets a value indicating whether the lead is qualified based on threshold.</summary>
    public required bool IsQualified { get; init; }

    /// <summary>Gets the recommended lead status based on score.</summary>
    public required LeadStatus RecommendedStatus { get; init; }

    /// <summary>Gets the breakdown of individual scoring factors.</summary>
    public required IReadOnlyList<ScoringFactor> Factors { get; init; }

    /// <summary>Gets the AI-based scoring component.</summary>
    public AIScoreComponent? AIScore { get; init; }

    /// <summary>Gets the business rules-based scoring component.</summary>
    public RulesScoreComponent? RulesScore { get; init; }

    /// <summary>Gets when the score was calculated.</summary>
    public required DateTime CalculatedAt { get; init; }

    /// <summary>Gets the trigger for this calculation.</summary>
    public string? Trigger { get; init; }
}

