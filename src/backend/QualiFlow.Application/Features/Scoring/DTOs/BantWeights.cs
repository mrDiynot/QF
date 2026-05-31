// -----------------------------------------------------------------------
// <copyright file="BantWeights.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// BANT (Budget, Authority, Need, Timeline) scoring weights.
/// </summary>
public sealed record BantWeights
{
    /// <summary>Gets the weight for Budget factor.</summary>
    public int Budget { get; init; } = 25;

    /// <summary>Gets the weight for Authority factor.</summary>
    public int Authority { get; init; } = 25;

    /// <summary>Gets the weight for Need factor.</summary>
    public int Need { get; init; } = 25;

    /// <summary>Gets the weight for Timeline factor.</summary>
    public int Timeline { get; init; } = 25;
}

