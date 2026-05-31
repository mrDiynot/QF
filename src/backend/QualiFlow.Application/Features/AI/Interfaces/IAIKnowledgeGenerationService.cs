// -----------------------------------------------------------------------
// <copyright file="IAIKnowledgeGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for AI-powered knowledge base content generation.
/// Generates articles, FAQs, and extracts common questions from conversations.
/// </summary>
public interface IAIKnowledgeGenerationService
{
    /// <summary>
    /// Generates a knowledge base article using AI.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="request">The generation request parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated article result.</returns>
    Task<KnowledgeArticleResult> GenerateArticleAsync(
        Guid businessId,
        KnowledgeGenerationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts FAQs from conversation history using AI analysis.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="request">The extraction request parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The extracted FAQs result.</returns>
    Task<ExtractFaqsResult> ExtractFaqsFromConversationsAsync(
        Guid businessId,
        ExtractFaqsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves a generated article to the knowledge base.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="article">The article result to save.</param>
    /// <param name="entryType">The knowledge entry type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the saved article.</returns>
    Task<Guid> SaveArticleAsync(
        Guid businessId,
        KnowledgeArticleResult article,
        Domain.Enums.KnowledgeEntryType entryType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves extracted FAQs to the knowledge base.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="faqs">The FAQ suggestions to save.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of FAQs saved.</returns>
    Task<int> SaveFaqsAsync(
        Guid businessId,
        IReadOnlyList<FaqSuggestion> faqs,
        CancellationToken cancellationToken = default);
}

