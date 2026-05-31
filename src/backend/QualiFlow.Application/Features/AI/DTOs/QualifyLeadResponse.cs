// -----------------------------------------------------------------------
// <copyright file="QualifyLeadResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Response from lead qualification analysis.
/// </summary>
public sealed record QualifyLeadResponse
{
    /// <summary>Gets the lead ID that was qualified.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the overall qualification score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets a value indicating whether the lead is qualified (score >= threshold).</summary>
    public required bool IsQualified { get; init; }

    /// <summary>Gets the AI's reasoning for the qualification decision.</summary>
    public required string Reasoning { get; init; }

    /// <summary>Gets the individual criterion scores.</summary>
    public required IReadOnlyList<CriterionScoreDto> CriterionScores { get; init; }

    /// <summary>Gets suggested next actions for the sales team.</summary>
    public IReadOnlyList<string>? SuggestedActions { get; init; }

    /// <summary>Gets the confidence level of the qualification (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets when the qualification was performed.</summary>
    public required DateTime QualifiedAt { get; init; }

    /// <summary>Gets a value indicating whether this result was from cache.</summary>
    public bool FromCache { get; init; }

    /// <summary>Gets the number of tokens used for this qualification.</summary>
    public int TokensUsed { get; init; }
}

