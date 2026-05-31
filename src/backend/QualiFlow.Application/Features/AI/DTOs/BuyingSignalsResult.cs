// -----------------------------------------------------------------------
// <copyright file="BuyingSignalsResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of buying signals detection.
/// </summary>
public sealed record BuyingSignalsResult
{
    /// <summary>Gets a value indicating whether buying signals were detected.</summary>
    public required bool HasBuyingSignals { get; init; }

    /// <summary>Gets the overall buying intent score (0-100).</summary>
    public required int BuyingIntentScore { get; init; }

    /// <summary>Gets the detected buying signals.</summary>
    public required IReadOnlyList<BuyingSignalDto> Signals { get; init; }

    /// <summary>Gets the urgency level.</summary>
    public string? UrgencyLevel { get; init; }

    /// <summary>Gets the recommended response strategy.</summary>
    public string? RecommendedStrategy { get; init; }
}

