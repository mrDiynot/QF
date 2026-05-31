// -----------------------------------------------------------------------
// <copyright file="CrmEnrichmentResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of AI-powered CRM data enrichment.
/// </summary>
public sealed record CrmEnrichmentResult
{
    /// <summary>Gets a value indicating whether enrichment was successful.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets the error message if enrichment failed.</summary>
    public string? ErrorMessage { get; init; }

    /// <summary>Gets a value indicating whether the usage limit was exceeded.</summary>
    public bool LimitExceeded { get; init; }

    /// <summary>Gets the conversation ID that was analyzed.</summary>
    public Guid ConversationId { get; init; }

    /// <summary>Gets the enrichment suggestions for the contact.</summary>
    public IReadOnlyList<CrmFieldSuggestion> ContactSuggestions { get; init; } = [];

    /// <summary>Gets the enrichment suggestions for the company.</summary>
    public IReadOnlyList<CrmFieldSuggestion> CompanySuggestions { get; init; } = [];

    /// <summary>Gets the enrichment suggestions for the deal.</summary>
    public IReadOnlyList<CrmFieldSuggestion> DealSuggestions { get; init; } = [];

    /// <summary>Gets the BANT scores extracted from the conversation.</summary>
    public BantScores? BantScores { get; init; }

    /// <summary>Gets the AI generation audit ID.</summary>
    public Guid? AuditId { get; init; }

    /// <summary>Gets the number of tokens used.</summary>
    public int TokensUsed { get; init; }

    /// <summary>Gets when the enrichment was performed.</summary>
    public DateTime EnrichedAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Creates a failed result.
    /// </summary>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="limitExceeded">Whether the limit was exceeded.</param>
    /// <returns>A failed enrichment result.</returns>
    public static CrmEnrichmentResult Failed(string errorMessage, bool limitExceeded = false) =>
        new()
        {
            Success = false,
            ErrorMessage = errorMessage,
            LimitExceeded = limitExceeded,
        };
}

/// <summary>
/// A suggested field value for CRM enrichment.
/// </summary>
public sealed record CrmFieldSuggestion
{
    /// <summary>Gets the field name to update.</summary>
    public required string FieldName { get; init; }

    /// <summary>Gets the current value (if any).</summary>
    public string? CurrentValue { get; init; }

    /// <summary>Gets the suggested new value.</summary>
    public required string SuggestedValue { get; init; }

    /// <summary>Gets the confidence score (0.0-1.0).</summary>
    public required double Confidence { get; init; }

    /// <summary>Gets the source quote from the conversation that supports this suggestion.</summary>
    public string? SourceQuote { get; init; }

    /// <summary>Gets the reasoning for this suggestion.</summary>
    public string? Reasoning { get; init; }

    /// <summary>Gets a value indicating whether this is a high-confidence suggestion.</summary>
    public bool IsHighConfidence => Confidence >= 0.7;
}

/// <summary>
/// BANT scores extracted from the conversation.
/// </summary>
public sealed record BantScores
{
    /// <summary>Gets the budget score (0-100).</summary>
    public int BudgetScore { get; init; }

    /// <summary>Gets the budget signals extracted.</summary>
    public IReadOnlyList<string> BudgetSignals { get; init; } = [];

    /// <summary>Gets the authority score (0-100).</summary>
    public int AuthorityScore { get; init; }

    /// <summary>Gets the authority signals extracted.</summary>
    public IReadOnlyList<string> AuthoritySignals { get; init; } = [];

    /// <summary>Gets the need score (0-100).</summary>
    public int NeedScore { get; init; }

    /// <summary>Gets the need signals extracted.</summary>
    public IReadOnlyList<string> NeedSignals { get; init; } = [];

    /// <summary>Gets the timeline score (0-100).</summary>
    public int TimelineScore { get; init; }

    /// <summary>Gets the timeline signals extracted.</summary>
    public IReadOnlyList<string> TimelineSignals { get; init; } = [];

    /// <summary>Gets the overall BANT score (average of all scores).</summary>
    public int OverallScore => (BudgetScore + AuthorityScore + NeedScore + TimelineScore) / 4;

    /// <summary>Gets the confidence level of the BANT extraction.</summary>
    public double Confidence { get; init; }
}

