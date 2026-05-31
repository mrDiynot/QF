// -----------------------------------------------------------------------
// <copyright file="RulesScoreComponent.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Business rules-based scoring component.
/// </summary>
public sealed record RulesScoreComponent
{
    /// <summary>Gets the overall rules score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets budget-related score.</summary>
    public int? BudgetScore { get; init; }

    /// <summary>Gets authority-related score.</summary>
    public int? AuthorityScore { get; init; }

    /// <summary>Gets need-related score.</summary>
    public int? NeedScore { get; init; }

    /// <summary>Gets timeline-related score.</summary>
    public int? TimelineScore { get; init; }

    /// <summary>Gets the number of rules matched.</summary>
    public required int RulesMatched { get; init; }
}

