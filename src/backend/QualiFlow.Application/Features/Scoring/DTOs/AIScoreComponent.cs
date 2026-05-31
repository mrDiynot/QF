// -----------------------------------------------------------------------
// <copyright file="AIScoreComponent.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// AI-based scoring component.
/// </summary>
public sealed record AIScoreComponent
{
    /// <summary>Gets the overall AI score (0-100).</summary>
    public required int Score { get; init; }

    /// <summary>Gets the confidence level (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets the AI's reasoning.</summary>
    public string? Reasoning { get; init; }

    /// <summary>Gets intent-based score contribution.</summary>
    public int? IntentScore { get; init; }

    /// <summary>Gets sentiment-based score contribution.</summary>
    public int? SentimentScore { get; init; }

    /// <summary>Gets engagement-based score contribution.</summary>
    public int? EngagementScore { get; init; }
}

