// -----------------------------------------------------------------------
// <copyright file="IntentDetectionResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Response from intent detection analysis.
/// </summary>
public sealed record IntentDetectionResponse
{
    /// <summary>Gets the primary detected intent.</summary>
    public required string PrimaryIntent { get; init; }

    /// <summary>Gets the intent category.</summary>
    public required string Category { get; init; }

    /// <summary>Gets the confidence score (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets secondary intents detected.</summary>
    public IReadOnlyList<SecondaryIntentDto>? SecondaryIntents { get; init; }

    /// <summary>Gets extracted entities.</summary>
    public IReadOnlyDictionary<string, string>? ExtractedEntities { get; init; }

    /// <summary>Gets detected buying signals.</summary>
    public IReadOnlyList<BuyingSignalDto>? BuyingSignals { get; init; }

    /// <summary>Gets the urgency level (low, medium, high, critical).</summary>
    public string? UrgencyLevel { get; init; }

    /// <summary>Gets suggested follow-up actions.</summary>
    public IReadOnlyList<string>? SuggestedActions { get; init; }

    /// <summary>Gets a value indicating whether this requires human escalation.</summary>
    public bool RequiresEscalation { get; init; }

    /// <summary>Gets the escalation reason if applicable.</summary>
    public string? EscalationReason { get; init; }
}

