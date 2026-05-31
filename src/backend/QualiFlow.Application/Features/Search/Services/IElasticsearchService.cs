namespace QualiFlow.Application.Features.Search.Services;

/// <summary>
/// Interface for Elasticsearch operations.
/// Provides methods for indexing, searching, and managing Elasticsearch documents.
/// </summary>
public interface IElasticsearchService
{
    /// <summary>
    /// Indexes a document to Elasticsearch.
    /// </summary>
    /// <typeparam name="T">The document type.</typeparam>
    /// <param name="indexName">The index name.</param>
    /// <param name="document">The document to index.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if indexing succeeded, false otherwise.</returns>
    Task<bool> IndexDocumentAsync<T>(
        string indexName,
        T document,
        string documentId,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Bulk indexes multiple documents to Elasticsearch.
    /// </summary>
    /// <typeparam name="T">The document type.</typeparam>
    /// <param name="indexName">The index name.</param>
    /// <param name="documents">The documents to index.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of documents successfully indexed.</returns>
    Task<long> BulkIndexDocumentsAsync<T>(
        string indexName,
        IEnumerable<T> documents,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Updates a document in Elasticsearch.
    /// </summary>
    /// <typeparam name="T">The document type.</typeparam>
    /// <param name="indexName">The index name.</param>
    /// <param name="document">The updated document.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if update succeeded, false otherwise.</returns>
    Task<bool> UpdateDocumentAsync<T>(
        string indexName,
        T document,
        string documentId,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Deletes a document from Elasticsearch.
    /// </summary>
    /// <param name="indexName">The index name.</param>
    /// <param name="documentId">The document ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deletion succeeded, false otherwise.</returns>
    Task<bool> DeleteDocumentAsync(
        string indexName,
        string documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches documents in Elasticsearch.
    /// </summary>
    /// <typeparam name="T">The document type.</typeparam>
    /// <param name="indexName">The index name.</param>
    /// <param name="query">The search query.</param>
    /// <param name="businessId">The business ID for multi-tenancy filtering.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Search results with total count.</returns>
    Task<SearchResult<T>> SearchAsync<T>(
        string indexName,
        string query,
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Creates an index with the specified mapping.
    /// </summary>
    /// <typeparam name="T">The document type.</typeparam>
    /// <param name="indexName">The index name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if index creation succeeded, false otherwise.</returns>
    Task<bool> CreateIndexAsync<T>(
        string indexName,
        CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Deletes an index.
    /// </summary>
    /// <param name="indexName">The index name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if index deletion succeeded, false otherwise.</returns>
    Task<bool> DeleteIndexAsync(
        string indexName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an index exists.
    /// </summary>
    /// <param name="indexName">The index name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if index exists, false otherwise.</returns>
    Task<bool> IndexExistsAsync(
        string indexName,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Search result with pagination information.
/// </summary>
/// <typeparam name="T">The document type.</typeparam>
public record SearchResult<T>
    where T : class
{
    public required IReadOnlyList<T> Results { get; init; }
    public required long Total { get; init; }
    public required int Page { get; init; }
    public required int PageSize { get; init; }
    public required int TotalPages { get; init; }
    public required long ExecutionTimeMs { get; init; }
}

