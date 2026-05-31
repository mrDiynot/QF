// -----------------------------------------------------------------------
// <copyright file="CriterionScoreDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Individual criterion score in qualification.
/// </summary>
public sealed record CriterionScoreDto
{
    /// <summary>Gets the criterion name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the raw score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets the weight of this criterion.</summary>
    public required int Weight { get; init; }

    /// <summary>Gets the weighted contribution to total score.</summary>
    public required float WeightedScore { get; init; }

    /// <summary>Gets the evidence extracted from conversation.</summary>
    public string? Evidence { get; init; }
}

