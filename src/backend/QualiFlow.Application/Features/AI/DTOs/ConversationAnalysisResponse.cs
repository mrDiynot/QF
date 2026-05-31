// -----------------------------------------------------------------------
// <copyright file="ConversationAnalysisResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Response from conversation analysis.
/// </summary>
public sealed record ConversationAnalysisResponse
{
    /// <summary>Gets the conversation ID that was analyzed.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the lead ID associated with the conversation.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the detected primary intent.</summary>
    public required string PrimaryIntent { get; init; }

    /// <summary>Gets the confidence score for intent detection (0-1).</summary>
    public required float IntentConfidence { get; init; }

    /// <summary>Gets the overall sentiment of the conversation.</summary>
    public required string Sentiment { get; init; }

    /// <summary>Gets the sentiment score (-1 to 1).</summary>
    public required float SentimentScore { get; init; }

    /// <summary>Gets key topics discussed in the conversation.</summary>
    public required IReadOnlyList<string> KeyTopics { get; init; }

    /// <summary>Gets extracted entities from the conversation.</summary>
    public IReadOnlyDictionary<string, string>? ExtractedEntities { get; init; }

    /// <summary>Gets detected pain points or concerns.</summary>
    public IReadOnlyList<string>? PainPoints { get; init; }

    /// <summary>Gets the total number of messages analyzed.</summary>
    public required int MessageCount { get; init; }

    /// <summary>Gets when the analysis was performed.</summary>
    public required DateTime AnalyzedAt { get; init; }
}

