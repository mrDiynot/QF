// -----------------------------------------------------------------------
// <copyright file="IFaqSearchService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Common.Models;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for semantic FAQ search.
/// </summary>
public interface IFaqSearchService
{
    /// <summary>
    /// Finds the best matching FAQ for a question.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="question">The user's question.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The best matching FAQ or null if no good match found.</returns>
    Task<FaqSearchResult?> FindBestMatchAsync(
        Guid businessId,
        string question,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds similar FAQs for a question.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="question">The user's question.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of similar FAQs ordered by relevance.</returns>
    Task<IEnumerable<FaqSearchResult>> FindSimilarAsync(
        Guid businessId,
        string question,
        int limit = 5,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Indexes a new FAQ with embeddings.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="question">The FAQ question.</param>
    /// <param name="answer">The FAQ answer.</param>
    /// <param name="category">Optional category.</param>
    /// <param name="tags">Optional tags.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created FAQ.</returns>
    Task<Guid> IndexFaqAsync(
        Guid businessId,
        string question,
        string answer,
        string? category = null,
        IEnumerable<string>? tags = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reindexes all FAQs for a business (regenerates embeddings).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of FAQs reindexed.</returns>
    Task<int> ReindexAllAsync(Guid businessId, CancellationToken cancellationToken = default);
}
