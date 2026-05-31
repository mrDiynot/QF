// -----------------------------------------------------------------------
// <copyright file="SuggestedResponseResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result containing AI-generated suggested response for an agent.
/// </summary>
public sealed record SuggestedResponseResult
{
    /// <summary>Gets the conversation ID this suggestion is for.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the suggested response text.</summary>
    public required string SuggestedResponse { get; init; }

    /// <summary>Gets the confidence score for this suggestion (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets the tone used for the response.</summary>
    public required string Tone { get; init; }

    /// <summary>Gets alternative response options.</summary>
    public IReadOnlyList<string>? Alternatives { get; init; }

    /// <summary>Gets relevant context used to generate the suggestion.</summary>
    public string? Context { get; init; }

    /// <summary>Gets when the suggestion was generated.</summary>
    public required DateTime GeneratedAt { get; init; }
}

