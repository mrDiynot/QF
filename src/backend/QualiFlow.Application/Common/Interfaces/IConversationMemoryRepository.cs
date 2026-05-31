// -----------------------------------------------------------------------
// <copyright file="IConversationMemoryRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Pgvector;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for conversation memory with semantic search capabilities.
/// </summary>
public interface IConversationMemoryRepository
{
    /// <summary>
    /// Gets a conversation memory by session ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation memory or null if not found.</returns>
    Task<ConversationMemory?> GetBySessionIdAsync(Guid businessId, Guid sessionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent conversation memories for a lead.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of recent memories ordered by importance and recency.</returns>
    Task<IEnumerable<ConversationMemory>> GetRecentMemoriesAsync(
        Guid businessId,
        Guid? leadId,
        int limit = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for similar conversation memories using vector similarity.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="queryEmbedding">The query embedding vector.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of similar memories with similarity scores.</returns>
    Task<IEnumerable<(ConversationMemory memory, float similarity)>> SearchSimilarAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new conversation memory.
    /// </summary>
    /// <param name="memory">The memory to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(ConversationMemory memory, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing conversation memory.
    /// </summary>
    /// <param name="memory">The memory to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(ConversationMemory memory, CancellationToken cancellationToken = default);
}
