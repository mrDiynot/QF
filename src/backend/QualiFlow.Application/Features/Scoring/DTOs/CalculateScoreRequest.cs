// -----------------------------------------------------------------------
// <copyright file="CalculateScoreRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Request to calculate a lead's score.
/// </summary>
public sealed record CalculateScoreRequest
{
    /// <summary>Gets the lead ID to score.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the business ID (tenant) for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets optional conversation ID to use for scoring.</summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Gets a value indicating whether to include AI-based scoring factors.
    /// </summary>
    public bool IncludeAIScoring { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether to save the score to history.
    /// </summary>
    public bool SaveToHistory { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether to update the lead's score field.
    /// </summary>
    public bool UpdateLeadScore { get; init; } = true;
}

