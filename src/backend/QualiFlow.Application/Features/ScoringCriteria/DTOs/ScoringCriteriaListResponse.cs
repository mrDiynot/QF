// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaListResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.ScoringCriteria.DTOs;

/// <summary>
/// Response DTO for listing scoring criteria with summary information.
/// </summary>
public record ScoringCriteriaListResponse
{
    /// <summary>Gets the list of scoring criteria.</summary>
    public IReadOnlyList<ScoringCriteriaResponse> Criteria { get; init; } = [];

    /// <summary>Gets the total weight of all active criteria.</summary>
    public int TotalWeight { get; init; }

    /// <summary>Gets a value indicating whether weights sum to 100.</summary>
    public bool IsWeightValid { get; init; }

    /// <summary>Gets the count of active criteria.</summary>
    public int ActiveCount { get; init; }

    /// <summary>Gets the total count of criteria.</summary>
    public int TotalCount { get; init; }
}

