// -----------------------------------------------------------------------
// <copyright file="IFaqEmbeddingRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Pgvector;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for FAQ embeddings with semantic search capabilities.
/// </summary>
public interface IFaqEmbeddingRepository
{
    /// <summary>
    /// Gets an FAQ by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="id">The FAQ ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The FAQ or null if not found.</returns>
    Task<FaqEmbedding?> GetByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all FAQs for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of FAQs.</returns>
    Task<IEnumerable<FaqEmbedding>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for similar FAQs using vector similarity.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="queryEmbedding">The query embedding vector.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="minSimilarity">Minimum similarity threshold (0-1).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of similar FAQs with similarity scores.</returns>
    Task<IEnumerable<(FaqEmbedding faq, float similarity)>> SearchSimilarAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        float minSimilarity = 0.7f,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new FAQ.
    /// </summary>
    /// <param name="faq">The FAQ to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(FaqEmbedding faq, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing FAQ.
    /// </summary>
    /// <param name="faq">The FAQ to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(FaqEmbedding faq, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an FAQ.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="id">The FAQ ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid businessId, Guid id, CancellationToken cancellationToken = default);
}
