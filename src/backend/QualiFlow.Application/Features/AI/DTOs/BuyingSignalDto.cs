// -----------------------------------------------------------------------
// <copyright file="BuyingSignalDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Detected buying signal.
/// </summary>
public sealed record BuyingSignalDto
{
    /// <summary>Gets the signal type.</summary>
    public required string SignalType { get; init; }

    /// <summary>Gets the signal strength (weak, moderate, strong).</summary>
    public required string Strength { get; init; }

    /// <summary>Gets the evidence from the message.</summary>
    public string? Evidence { get; init; }
}

