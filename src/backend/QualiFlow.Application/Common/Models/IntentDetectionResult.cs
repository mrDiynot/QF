// -----------------------------------------------------------------------
// <copyright file="IntentDetectionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of intent detection analysis.
/// </summary>
public sealed record IntentDetectionResult
{
    /// <summary>Gets the detected primary intent.</summary>
    public required string PrimaryIntent { get; init; }

    /// <summary>Gets the confidence score for the primary intent (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets secondary intents detected.</summary>
    public IReadOnlyList<SecondaryIntent>? SecondaryIntents { get; init; }

    /// <summary>Gets extracted entities from the message.</summary>
    public IReadOnlyDictionary<string, string>? ExtractedEntities { get; init; }
}

