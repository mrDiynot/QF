// -----------------------------------------------------------------------
// <copyright file="CriterionScore.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Score for an individual criterion.
/// </summary>
public sealed record CriterionScore
{
    /// <summary>Gets the criterion name.</summary>
    public required string CriterionName { get; init; }

    /// <summary>Gets the raw score for this criterion (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets the weighted score contribution.</summary>
    public required float WeightedScore { get; init; }

    /// <summary>Gets the evidence extracted from conversation.</summary>
    public string? Evidence { get; init; }
}

