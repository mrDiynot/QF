// -----------------------------------------------------------------------
// <copyright file="StatusThresholds.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Score thresholds for automatic status transitions.
/// </summary>
public sealed record StatusThresholds
{
    /// <summary>Gets the minimum score for Contacted status.</summary>
    public int Contacted { get; init; } = 20;

    /// <summary>Gets the minimum score for Engaged status.</summary>
    public int Engaged { get; init; } = 40;

    /// <summary>Gets the minimum score for Qualified status.</summary>
    public int Qualified { get; init; } = 70;

    /// <summary>Gets the minimum score for Opportunity status.</summary>
    public int Opportunity { get; init; } = 85;
}

