// -----------------------------------------------------------------------
// <copyright file="IAIConversationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI-powered conversation analysis and lead qualification.
/// Provides high-level operations that combine OpenAI capabilities with business context.
/// </summary>
public interface IAIConversationService
{
    /// <summary>
    /// Qualifies a lead based on their conversation history.
    /// Uses AI to analyze messages and score against business-specific criteria.
    /// </summary>
    /// <param name="request">The qualification request with lead and conversation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The qualification result with score, reasoning, and suggested actions.</returns>
    Task<QualifyLeadResponse> QualifyLeadAsync(
        QualifyLeadRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Analyzes a conversation to extract key information and insights.
    /// </summary>
    /// <param name="conversationId">The conversation ID to analyze.</param>
    /// <param name="businessId">The business (tenant) ID for multi-tenancy.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Analysis results including intent, sentiment, and extracted entities.</returns>
    Task<ConversationAnalysisResponse> AnalyzeConversationAsync(
        Guid conversationId,
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a suggested response for an agent based on conversation context.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="businessId">The business (tenant) ID for multi-tenancy.</param>
    /// <param name="tone">Optional tone preference (professional, friendly, etc.).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A suggested response with confidence score.</returns>
    Task<SuggestedResponseResult> GenerateSuggestedResponseAsync(
        Guid conversationId,
        Guid businessId,
        string? tone = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets AI usage metrics for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="startDate">Start date of the range.</param>
    /// <param name="endDate">End date of the range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Usage metrics including token counts and costs.</returns>
    Task<AIUsageMetrics> GetUsageMetricsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

