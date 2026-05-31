// -----------------------------------------------------------------------
// <copyright file="BANTExtractionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Scoring.DTOs;

/// <summary>
/// Result of AI-powered BANT extraction from conversation messages.
/// </summary>
public sealed record BantExtractionResult
{
    /// <summary>Gets the Budget score (0-100).</summary>
    public required int BudgetScore { get; init; }

    /// <summary>Gets Budget signals detected in the conversation.</summary>
    public required IReadOnlyList<string> BudgetSignals { get; init; }

    /// <summary>Gets the Authority score (0-100).</summary>
    public required int AuthorityScore { get; init; }

    /// <summary>Gets Authority signals detected in the conversation.</summary>
    public required IReadOnlyList<string> AuthoritySignals { get; init; }

    /// <summary>Gets the Need score (0-100).</summary>
    public required int NeedScore { get; init; }

    /// <summary>Gets Need signals detected in the conversation.</summary>
    public required IReadOnlyList<string> NeedSignals { get; init; }

    /// <summary>Gets the Timeline score (0-100).</summary>
    public required int TimelineScore { get; init; }

    /// <summary>Gets Timeline signals detected in the conversation.</summary>
    public required IReadOnlyList<string> TimelineSignals { get; init; }

    /// <summary>Gets the overall confidence of the extraction (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets additional reasoning from the AI.</summary>
    public string? Reasoning { get; init; }

    /// <summary>Gets key quotes that support the BANT analysis.</summary>
    public IReadOnlyList<string>? SupportingQuotes { get; init; }
}

/// <summary>
/// Request for BANT extraction from conversation.
/// </summary>
public sealed record BantExtractionRequest
{
    /// <summary>Gets the lead ID.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the business ID.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the conversation ID to analyze.</summary>
    public Guid? ConversationId { get; init; }

    /// <summary>Gets the conversation messages to analyze.</summary>
    public IReadOnlyList<ConversationMessage>? Messages { get; init; }

    /// <summary>Gets the business context for more accurate extraction.</summary>
    public string? BusinessContext { get; init; }

    /// <summary>Gets industry-specific keywords to look for.</summary>
    public IReadOnlyList<string>? IndustryKeywords { get; init; }
}

/// <summary>
/// Represents a message in a conversation for BANT analysis.
/// </summary>
public sealed record ConversationMessage
{
    /// <summary>Gets the message content.</summary>
    public required string Content { get; init; }

    /// <summary>Gets a value indicating whether this message is from the lead (vs. business).</summary>
    public required bool IsFromLead { get; init; }

    /// <summary>Gets when the message was sent.</summary>
    public required DateTime Timestamp { get; init; }
}
