// -----------------------------------------------------------------------
// <copyright file="QuickReplySuggestionRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for AI-generated quick reply suggestions.
/// </summary>
public sealed record QuickReplySuggestionRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the conversation ID for context.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the last message from the customer.</summary>
    public required string LastMessage { get; init; }

    /// <summary>Gets optional recent conversation history for context.</summary>
    public IReadOnlyList<string>? ConversationHistory { get; init; }

    /// <summary>Gets the detected intent of the last message (if available).</summary>
    public string? DetectedIntent { get; init; }

    /// <summary>Gets the detected sentiment (if available).</summary>
    public string? DetectedSentiment { get; init; }

    /// <summary>Gets the number of suggestions to generate (default: 5).</summary>
    public int SuggestionCount { get; init; } = 5;
}

/// <summary>
/// Result of AI quick reply suggestion generation.
/// </summary>
public sealed record QuickReplySuggestionResult
{
    /// <summary>Gets a value indicating whether generation was successful.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets the error message if generation failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether usage limit was exceeded.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>Gets the list of suggested quick replies.</summary>
    public IReadOnlyList<QuickReplySuggestion> Suggestions { get; init; } = [];

    /// <summary>Gets the AI generation audit ID.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets the generation time in milliseconds.</summary>
    public int GenerationTimeMs { get; init; }

    /// <summary>Gets the timestamp of generation.</summary>
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="limitExceeded">Whether limit was exceeded.</param>
    /// <returns>A failed result.</returns>
    public static QuickReplySuggestionResult Failed(string errorMessage, bool limitExceeded = false) =>
        new()
        {
            Success = false,
            ErrorMessage = errorMessage,
            LimitExceeded = limitExceeded,
        };
}

/// <summary>
/// A single quick reply suggestion.
/// </summary>
public sealed record QuickReplySuggestion
{
    /// <summary>Gets the suggested reply text.</summary>
    public required string Text { get; init; }

    /// <summary>Gets the confidence score (0-100).</summary>
    public int Confidence { get; init; }

    /// <summary>Gets the category/intent this reply addresses.</summary>
    public string? Category { get; init; }

    /// <summary>Gets the tone of the reply (friendly, professional, empathetic).</summary>
    public string Tone { get; init; } = "professional";

    /// <summary>Gets a value indicating whether this is a closing reply (ends conversation).</summary>
    public bool IsClosing { get; init; }

    /// <summary>Gets a brief explanation of why this reply is suggested.</summary>
    public string? Rationale { get; init; }
}

