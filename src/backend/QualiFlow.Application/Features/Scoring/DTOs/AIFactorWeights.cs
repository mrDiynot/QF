// -----------------------------------------------------------------------
// <copyright file="AIFactorWeights.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// AI factor scoring weights.
/// </summary>
public sealed record AIFactorWeights
{
    /// <summary>Gets the weight for Intent factor.</summary>
    public int Intent { get; init; } = 40;

    /// <summary>Gets the weight for Sentiment factor.</summary>
    public int Sentiment { get; init; } = 30;

    /// <summary>Gets the weight for Engagement factor.</summary>
    public int Engagement { get; init; } = 30;
}

