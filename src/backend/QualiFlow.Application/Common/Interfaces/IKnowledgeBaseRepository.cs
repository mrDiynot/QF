// -----------------------------------------------------------------------
// <copyright file="IKnowledgeBaseRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Pgvector;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for knowledge base documents and chunks with vector search.
/// </summary>
public interface IKnowledgeBaseRepository
{
    /// <summary>
    /// Gets a knowledge base document by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The document or null if not found.</returns>
    Task<KnowledgeBaseDocument?> GetDocumentByIdAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all knowledge base documents for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="category">Optional category filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of documents.</returns>
    Task<IEnumerable<KnowledgeBaseDocument>> GetDocumentsAsync(
        Guid businessId,
        string? category = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new knowledge base document.
    /// </summary>
    /// <param name="document">The document to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddDocumentAsync(KnowledgeBaseDocument document, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing knowledge base document.
    /// </summary>
    /// <param name="document">The document to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateDocumentAsync(KnowledgeBaseDocument document, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a knowledge base document and its chunks.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteDocumentAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches for similar knowledge base chunks using vector similarity.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="queryEmbedding">The query embedding vector.</param>
    /// <param name="limit">Maximum number of results.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of similar chunks with similarity scores.</returns>
    Task<IEnumerable<(KnowledgeBaseChunk chunk, float similarity)>> SearchSimilarChunksAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all chunks for a document.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of chunks ordered by chunk order.</returns>
    Task<IEnumerable<KnowledgeBaseChunk>> GetDocumentChunksAsync(
        Guid businessId,
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds multiple chunks for a document.
    /// </summary>
    /// <param name="chunks">The chunks to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddChunksAsync(IEnumerable<KnowledgeBaseChunk> chunks, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all chunks for a document.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteDocumentChunksAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default);
}
