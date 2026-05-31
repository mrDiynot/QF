// -----------------------------------------------------------------------
// <copyright file="ScoreHistoryDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// DTO for score history record.
/// </summary>
public sealed record ScoreHistoryDto
{
    /// <summary>Gets the history record ID.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the lead ID.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the score value.</summary>
    public required int Score { get; init; }

    /// <summary>Gets the previous score.</summary>
    public int? PreviousScore { get; init; }

    /// <summary>Gets the score change.</summary>
    public required int ScoreChange { get; init; }

    /// <summary>Gets the source of the score.</summary>
    public required string Source { get; init; }

    /// <summary>Gets the reason for the change.</summary>
    public string? Reason { get; init; }

    /// <summary>Gets when the score was recorded.</summary>
    public required DateTime ScoredAt { get; init; }
}

