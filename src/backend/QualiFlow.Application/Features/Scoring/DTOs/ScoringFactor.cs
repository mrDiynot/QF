// -----------------------------------------------------------------------
// <copyright file="ScoringFactor.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Individual scoring factor contribution.
/// </summary>
public sealed record ScoringFactor
{
    /// <summary>Gets the factor name.</summary>
    public required string Name { get; init; }

    /// <summary>Gets the factor category (AI, Rule, etc.).</summary>
    public required string Category { get; init; }

    /// <summary>Gets the raw score for this factor (0-100).</summary>
    public required int RawScore { get; init; }

    /// <summary>Gets the weight of this factor (0-100, percentage).</summary>
    public required int Weight { get; init; }

    /// <summary>Gets the weighted contribution to final score.</summary>
    public required float WeightedScore { get; init; }

    /// <summary>Gets optional evidence or explanation.</summary>
    public string? Evidence { get; init; }
}

