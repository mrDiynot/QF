// -----------------------------------------------------------------------
// <copyright file="ScoringCriterion.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Represents a scoring criterion for lead qualification.
/// </summary>
public sealed record ScoringCriterion
{
    /// <summary>Gets the criterion name (e.g., "Budget", "Timeline", "Authority").</summary>
    public required string Name { get; init; }

    /// <summary>Gets the weight of this criterion (0-100, must sum to 100 across all criteria).</summary>
    public required int Weight { get; init; }

    /// <summary>Gets the description of what qualifies for high scores.</summary>
    public required string Description { get; init; }

    /// <summary>Gets AI prompt hints for extracting this criterion.</summary>
    public string? ExtractionHint { get; init; }
}

