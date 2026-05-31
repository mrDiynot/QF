// -----------------------------------------------------------------------
// <copyright file="IAIQuickReplySuggestionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI-powered quick reply suggestions.
/// Generates contextual reply options based on conversation context.
/// </summary>
public interface IAIQuickReplySuggestionService
{
    /// <summary>
    /// Generates quick reply suggestions based on conversation context.
    /// Uses gpt-4o-mini for fast response times (&lt;500ms target).
    /// </summary>
    /// <param name="request">The suggestion request with conversation context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Quick reply suggestions with confidence scores.</returns>
    Task<QuickReplySuggestionResult> GenerateSuggestionsAsync(
        QuickReplySuggestionRequest request,
        CancellationToken cancellationToken = default);
}

