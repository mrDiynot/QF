using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Nest;
using QualiFlow.Application.Features.Search.Services;
using MsLogLevel = Microsoft.Extensions.Logging.LogLevel;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Elasticsearch service implementation using NEST client.
/// Provides full-text search and indexing capabilities (S15-BE-001).
/// </summary>
public partial class ElasticsearchService : IElasticsearchService
{
    private readonly IElasticClient _client;
    private readonly ILogger<ElasticsearchService> _logger;

    public ElasticsearchService(
        IElasticClient client,
        ILogger<ElasticsearchService> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<bool> IndexDocumentAsync<T>(
        string indexName,
        T document,
        string documentId,
        CancellationToken cancellationToken = default)
        where T : class
    {
        try
        {
            var response = await _client.IndexAsync(
                document,
                idx => idx
                    .Index(indexName)
                    .Id(documentId)
                    .Refresh(Elasticsearch.Net.Refresh.False), // Async refresh
                cancellationToken);

            if (!response.IsValid)
            {
                LogIndexFailed(_logger, indexName, documentId, response.OriginalException?.Message ?? "Unknown error");
                return false;
            }

            LogIndexSuccess(_logger, indexName, documentId);
            return true;
        }
        catch (Exception ex)
        {
            LogIndexException(_logger, indexName, documentId, ex);
            return false;
        }
    }

    public async Task<long> BulkIndexDocumentsAsync<T>(
        string indexName,
        IEnumerable<T> documents,
        CancellationToken cancellationToken = default)
        where T : class
    {
        try
        {
            var documentsList = documents.ToList();
            if (documentsList.Count == 0)
            {
                return 0;
            }

            var response = await _client.BulkAsync(
                b => b
                    .Index(indexName)
                    .IndexMany(documentsList)
                    .Refresh(Elasticsearch.Net.Refresh.False), // Async refresh
                cancellationToken);

            if (!response.IsValid)
            {
                LogBulkIndexFailed(_logger, indexName, documentsList.Count, response.OriginalException?.Message ?? "Unknown error");
                return 0;
            }

            var successCount = documentsList.Count - response.ItemsWithErrors.Count();
            LogBulkIndexSuccess(_logger, indexName, successCount, documentsList.Count);
            return successCount;
        }
        catch (Exception ex)
        {
            LogBulkIndexException(_logger, indexName, ex);
            return 0;
        }
    }

    public async Task<bool> UpdateDocumentAsync<T>(
        string indexName,
        T document,
        string documentId,
        CancellationToken cancellationToken = default)
        where T : class
    {
        try
        {
            var response = await _client.UpdateAsync<T>(
                documentId,
                u => u
                    .Index(indexName)
                    .Doc(document)
                    .Refresh(Elasticsearch.Net.Refresh.False), // Async refresh
                cancellationToken);

            if (!response.IsValid)
            {
                LogUpdateFailed(_logger, indexName, documentId, response.OriginalException?.Message ?? "Unknown error");
                return false;
            }

            LogUpdateSuccess(_logger, indexName, documentId);
            return true;
        }
        catch (Exception ex)
        {
            LogUpdateException(_logger, indexName, documentId, ex);
            return false;
        }
    }

    public async Task<bool> DeleteDocumentAsync(
        string indexName,
        string documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _client.DeleteAsync<object>(
                documentId,
                d => d
                    .Index(indexName)
                    .Refresh(Elasticsearch.Net.Refresh.False), // Async refresh
                cancellationToken);

            // Ignore NotFound errors (document already deleted)
            if (!response.IsValid && response.ServerError?.Status != 404)
            {
                LogDeleteFailed(_logger, indexName, documentId, response.OriginalException?.Message ?? "Unknown error");
                return false;
            }

            LogDeleteSuccess(_logger, indexName, documentId);
            return true;
        }
        catch (Exception ex)
        {
            LogDeleteException(_logger, indexName, documentId, ex);
            return false;
        }
    }

    public async Task<SearchResult<T>> SearchAsync<T>(
        string indexName,
        string query,
        Guid businessId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
        where T : class
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            var from = (page - 1) * pageSize;

            var response = await _client.SearchAsync<T>(
                s => s
                    .Index(indexName)
                    .From(from)
                    .Size(pageSize)
                    .Query(q => q
                        .Bool(b => b
                            .Must(
                                m => m.Term("businessId", businessId.ToString()), // Multi-tenancy filter
                                m => m.MultiMatch(mm => mm
                                    .Query(query)
                                    .Type(TextQueryType.BestFields)
                                    .Fuzziness(Fuzziness.Auto))))),
                cancellationToken);

            stopwatch.Stop();

            if (!response.IsValid)
            {
                LogSearchFailed(_logger, indexName, query, response.OriginalException?.Message ?? "Unknown error");
                return new SearchResult<T>
                {
                    Results = Array.Empty<T>(),
                    Total = 0,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = 0,
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
                };
            }

            var totalPages = (int)Math.Ceiling((double)response.Total / pageSize);

            LogSearchSuccess(_logger, indexName, query, response.Total, stopwatch.ElapsedMilliseconds);

            return new SearchResult<T>
            {
                Results = response.Documents.ToList(),
                Total = response.Total,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogSearchException(_logger, indexName, query, ex);
            return new SearchResult<T>
            {
                Results = Array.Empty<T>(),
                Total = 0,
                Page = page,
                PageSize = pageSize,
                TotalPages = 0,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            };
        }
    }

    public async Task<bool> CreateIndexAsync<T>(
        string indexName,
        CancellationToken cancellationToken = default)
        where T : class
    {
        try
        {
            var response = await _client.Indices.CreateAsync(
                indexName,
                c => c
                    .Map<T>(m => m.AutoMap())
                    .Settings(s => s
                        .NumberOfShards(1)
                        .NumberOfReplicas(1)
                        .RefreshInterval("1s")), // Near real-time refresh (1 second)
                cancellationToken);

            if (!response.IsValid)
            {
                LogCreateIndexFailed(_logger, indexName, response.OriginalException?.Message ?? "Unknown error");
                return false;
            }

            LogCreateIndexSuccess(_logger, indexName);
            return true;
        }
        catch (Exception ex)
        {
            LogCreateIndexException(_logger, indexName, ex);
            return false;
        }
    }

    public async Task<bool> DeleteIndexAsync(
        string indexName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _client.Indices.DeleteAsync(indexName, ct: cancellationToken);

            if (!response.IsValid)
            {
                LogDeleteIndexFailed(_logger, indexName, response.OriginalException?.Message ?? "Unknown error");
                return false;
            }

            LogDeleteIndexSuccess(_logger, indexName);
            return true;
        }
        catch (Exception ex)
        {
            LogDeleteIndexException(_logger, indexName, ex);
            return false;
        }
    }

    public async Task<bool> IndexExistsAsync(
        string indexName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _client.Indices.ExistsAsync(indexName, ct: cancellationToken);
            return response.Exists;
        }
        catch (Exception ex)
        {
            LogIndexExistsException(_logger, indexName, ex);
            return false;
        }
    }

    // Logging methods using LoggerMessage source generators
    [LoggerMessage(EventId = 1, Level = MsLogLevel.Information, Message = "Indexed document to {IndexName} with ID {DocumentId}")]
    private static partial void LogIndexSuccess(ILogger logger, string indexName, string documentId);

    [LoggerMessage(EventId = 2, Level = MsLogLevel.Error, Message = "Failed to index document to {IndexName} with ID {DocumentId}: {Error}")]
    private static partial void LogIndexFailed(ILogger logger, string indexName, string documentId, string error);

    [LoggerMessage(EventId = 3, Level = MsLogLevel.Error, Message = "Exception indexing document to {IndexName} with ID {DocumentId}")]
    private static partial void LogIndexException(ILogger logger, string indexName, string documentId, Exception ex);

    [LoggerMessage(EventId = 4, Level = MsLogLevel.Information, Message = "Bulk indexed {SuccessCount}/{TotalCount} documents to {IndexName}")]
    private static partial void LogBulkIndexSuccess(ILogger logger, string indexName, long successCount, int totalCount);

    [LoggerMessage(EventId = 5, Level = MsLogLevel.Error, Message = "Failed to bulk index {Count} documents to {IndexName}: {Error}")]
    private static partial void LogBulkIndexFailed(ILogger logger, string indexName, int count, string error);

    [LoggerMessage(EventId = 6, Level = MsLogLevel.Error, Message = "Exception bulk indexing documents to {IndexName}")]
    private static partial void LogBulkIndexException(ILogger logger, string indexName, Exception ex);

    [LoggerMessage(EventId = 7, Level = MsLogLevel.Information, Message = "Updated document in {IndexName} with ID {DocumentId}")]
    private static partial void LogUpdateSuccess(ILogger logger, string indexName, string documentId);

    [LoggerMessage(EventId = 8, Level = MsLogLevel.Error, Message = "Failed to update document in {IndexName} with ID {DocumentId}: {Error}")]
    private static partial void LogUpdateFailed(ILogger logger, string indexName, string documentId, string error);

    [LoggerMessage(EventId = 9, Level = MsLogLevel.Error, Message = "Exception updating document in {IndexName} with ID {DocumentId}")]
    private static partial void LogUpdateException(ILogger logger, string indexName, string documentId, Exception ex);

    [LoggerMessage(EventId = 10, Level = MsLogLevel.Information, Message = "Deleted document from {IndexName} with ID {DocumentId}")]
    private static partial void LogDeleteSuccess(ILogger logger, string indexName, string documentId);

    [LoggerMessage(EventId = 11, Level = MsLogLevel.Error, Message = "Failed to delete document from {IndexName} with ID {DocumentId}: {Error}")]
    private static partial void LogDeleteFailed(ILogger logger, string indexName, string documentId, string error);

    [LoggerMessage(EventId = 12, Level = MsLogLevel.Error, Message = "Exception deleting document from {IndexName} with ID {DocumentId}")]
    private static partial void LogDeleteException(ILogger logger, string indexName, string documentId, Exception ex);

    [LoggerMessage(EventId = 13, Level = MsLogLevel.Information, Message = "Search in {IndexName} for query '{Query}' returned {Total} results in {ExecutionTimeMs}ms")]
    private static partial void LogSearchSuccess(ILogger logger, string indexName, string query, long total, long executionTimeMs);

    [LoggerMessage(EventId = 14, Level = MsLogLevel.Error, Message = "Failed to search in {IndexName} for query '{Query}': {Error}")]
    private static partial void LogSearchFailed(ILogger logger, string indexName, string query, string error);

    [LoggerMessage(EventId = 15, Level = MsLogLevel.Error, Message = "Exception searching in {IndexName} for query '{Query}'")]
    private static partial void LogSearchException(ILogger logger, string indexName, string query, Exception ex);

    [LoggerMessage(EventId = 16, Level = MsLogLevel.Information, Message = "Created index {IndexName}")]
    private static partial void LogCreateIndexSuccess(ILogger logger, string indexName);

    [LoggerMessage(EventId = 17, Level = MsLogLevel.Error, Message = "Failed to create index {IndexName}: {Error}")]
    private static partial void LogCreateIndexFailed(ILogger logger, string indexName, string error);

    [LoggerMessage(EventId = 18, Level = MsLogLevel.Error, Message = "Exception creating index {IndexName}")]
    private static partial void LogCreateIndexException(ILogger logger, string indexName, Exception ex);

    [LoggerMessage(EventId = 19, Level = MsLogLevel.Information, Message = "Deleted index {IndexName}")]
    private static partial void LogDeleteIndexSuccess(ILogger logger, string indexName);

    [LoggerMessage(EventId = 20, Level = MsLogLevel.Error, Message = "Failed to delete index {IndexName}: {Error}")]
    private static partial void LogDeleteIndexFailed(ILogger logger, string indexName, string error);

    [LoggerMessage(EventId = 21, Level = MsLogLevel.Error, Message = "Exception deleting index {IndexName}")]
    private static partial void LogDeleteIndexException(ILogger logger, string indexName, Exception ex);

    [LoggerMessage(EventId = 22, Level = MsLogLevel.Error, Message = "Exception checking if index {IndexName} exists")]
    private static partial void LogIndexExistsException(ILogger logger, string indexName, Exception ex);
}

