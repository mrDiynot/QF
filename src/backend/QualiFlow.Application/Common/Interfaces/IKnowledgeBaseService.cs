// -----------------------------------------------------------------------
// <copyright file="IKnowledgeBaseService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for knowledge base RAG (Retrieval-Augmented Generation).
/// </summary>
public interface IKnowledgeBaseService
{
    /// <summary>
    /// Indexes a document by chunking and generating embeddings.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="title">The document title.</param>
    /// <param name="content">The document content.</param>
    /// <param name="category">Optional category.</param>
    /// <param name="tags">Optional tags.</param>
    /// <param name="sourceUrl">Optional source URL.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the indexed document.</returns>
#pragma warning disable CA1054 // URI-like parameters should not be strings
    Task<Guid> IndexDocumentAsync(
        Guid businessId,
        string title,
        string content,
        string? category = null,
        IEnumerable<string>? tags = null,
        string? sourceUrl = null,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054

    /// <summary>
    /// Retrieves relevant knowledge base context for a query.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">The user query.</param>
    /// <param name="maxChunks">Maximum number of chunks to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Relevant context from the knowledge base.</returns>
    Task<string> RetrieveRelevantContextAsync(
        Guid businessId,
        string query,
        int maxChunks = 3,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates an AI response augmented with knowledge base context.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userQuery">The user query.</param>
    /// <param name="conversationHistory">Optional conversation history.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI-generated response with RAG context.</returns>
    Task<string> GenerateAugmentedResponseAsync(
        Guid businessId,
        string userQuery,
        string? conversationHistory = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reindexes all documents for a business (regenerates embeddings).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of documents reindexed.</returns>
    Task<int> ReindexAllDocumentsAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a document from the knowledge base.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteDocumentAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default);
}
