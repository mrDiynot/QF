// -----------------------------------------------------------------------
// <copyright file="KnowledgeBaseRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for knowledge base documents and chunks.
/// </summary>
public sealed class KnowledgeBaseRepository : IKnowledgeBaseRepository
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<KnowledgeBaseRepository> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="KnowledgeBaseRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    public KnowledgeBaseRepository(QualiFlowDbContext context, ILogger<KnowledgeBaseRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<KnowledgeBaseDocument?> GetDocumentByIdAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default)
    {
        return await _context.KnowledgeBaseDocuments
            .Include(d => d.Chunks)
            .Where(d => d.BusinessId == businessId && d.Id == documentId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<KnowledgeBaseDocument>> GetDocumentsAsync(
        Guid businessId,
        string? category = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.KnowledgeBaseDocuments
            .Where(d => d.BusinessId == businessId);

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(d => d.Category == category);
        }

        return await query
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddDocumentAsync(KnowledgeBaseDocument document, CancellationToken cancellationToken = default)
    {
        await _context.KnowledgeBaseDocuments.AddAsync(document, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateDocumentAsync(KnowledgeBaseDocument document, CancellationToken cancellationToken = default)
    {
        _context.KnowledgeBaseDocuments.Update(document);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteDocumentAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default)
    {
        var document = await _context.KnowledgeBaseDocuments
            .Where(d => d.BusinessId == businessId && d.Id == documentId)
            .FirstOrDefaultAsync(cancellationToken);

        if (document != null)
        {
            _context.KnowledgeBaseDocuments.Remove(document);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<(KnowledgeBaseChunk chunk, float similarity)>> SearchSimilarChunksAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug(
                "Searching for similar chunks: BusinessId={BusinessId}, Limit={Limit}, EmbeddingDimensions={Dimensions}",
                businessId, limit, queryEmbedding.ToArray().Length);

            // Use raw SQL for vector similarity search to avoid EF Core parameter serialization issues
            // Convert Vector to string format for PostgreSQL: '[0.1, 0.2, 0.3]'
            var vectorString = $"'[{string.Join(",", queryEmbedding.ToArray())}]'";

            // Use PascalCase aliases to match VectorSearchResult property names
            // (EF Core SqlQueryRaw doesn't auto-map snake_case to PascalCase)
            // CAST distance to real (float4) to ensure proper type mapping
            var sql = @"
                SELECT c.id as ""Id"", c.business_id as ""BusinessId"", c.document_id as ""DocumentId"", 
                       c.chunk_text as ""ChunkText"", c.chunk_index as ""ChunkIndex"", 
                       c.token_count as ""TokenCount"", c.created_at as ""CreatedAt"", 
                       c.updated_at as ""UpdatedAt"", c.deleted_at as ""DeletedAt"",
                       d.id as ""DocId"", d.business_id as ""DocBusinessId"", d.title as ""Title"", 
                       d.content as ""Content"", d.category as ""Category"", d.source_url as ""SourceUrl"", 
                       d.is_active as ""IsActive"", d.created_at as ""DocCreatedAt"", 
                       d.updated_at as ""DocUpdatedAt"", d.deleted_at as ""DocDeletedAt"",
                       CAST((c.embedding <=> " + vectorString + @"::vector) AS real) as ""Distance""
                FROM knowledge_base_chunks c
                INNER JOIN knowledge_base_documents d ON c.document_id = d.id
                WHERE d.business_id = {0} AND c.embedding IS NOT NULL
                ORDER BY (c.embedding <=> " + vectorString + @"::vector)
                LIMIT {1}";

            _logger.LogWarning(
                "RAG SEARCH: Executing SQL for BusinessId={BusinessId}, Limit={Limit}, VectorDimensions={Dimensions}",
                businessId, limit, queryEmbedding.ToArray().Length);

            // Use raw ADO.NET to bypass EF Core SqlQueryRaw mapping issues with float columns
            var results = new List<(KnowledgeBaseChunk chunk, float similarity)>();
            var conn = _context.Database.GetDbConnection();

            try
            {
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync(cancellationToken);
                }

                using var cmd = conn.CreateCommand();
#pragma warning disable CA2100 // businessId is a Guid and limit is int - no SQL injection risk
                cmd.CommandText = sql
                    .Replace("{0}", $"'{businessId}'", StringComparison.Ordinal)
                    .Replace("{1}", limit.ToString(System.Globalization.CultureInfo.InvariantCulture), StringComparison.Ordinal);
#pragma warning restore CA2100

                _logger.LogDebug("Executing ADO.NET vector search query");

                using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    var distance = reader.GetFloat(reader.GetOrdinal("Distance"));
                    var similarity = 1.0f - distance;

                    // Cache ordinals for nullable columns
                    var updatedAtOrdinal = reader.GetOrdinal("UpdatedAt");
                    var deletedAtOrdinal = reader.GetOrdinal("DeletedAt");
                    var sourceUrlOrdinal = reader.GetOrdinal("SourceUrl");
                    var docUpdatedAtOrdinal = reader.GetOrdinal("DocUpdatedAt");
                    var docDeletedAtOrdinal = reader.GetOrdinal("DocDeletedAt");

                    var chunk = new KnowledgeBaseChunk
                    {
                        Id = reader.GetGuid(reader.GetOrdinal("Id")),
                        BusinessId = reader.GetGuid(reader.GetOrdinal("BusinessId")),
                        DocumentId = reader.GetGuid(reader.GetOrdinal("DocumentId")),
                        ChunkText = reader.GetString(reader.GetOrdinal("ChunkText")),
                        ChunkIndex = reader.GetInt32(reader.GetOrdinal("ChunkIndex")),
                        TokenCount = reader.GetInt32(reader.GetOrdinal("TokenCount")),
                        Embedding = null,
                        CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                        UpdatedAt = await reader.IsDBNullAsync(updatedAtOrdinal, cancellationToken) ? null : reader.GetDateTime(updatedAtOrdinal),
                        DeletedAt = await reader.IsDBNullAsync(deletedAtOrdinal, cancellationToken) ? null : reader.GetDateTime(deletedAtOrdinal),
                        Document = new KnowledgeBaseDocument
                        {
                            Id = reader.GetGuid(reader.GetOrdinal("DocId")),
                            BusinessId = reader.GetGuid(reader.GetOrdinal("DocBusinessId")),
                            Title = reader.GetString(reader.GetOrdinal("Title")),
                            Content = reader.GetString(reader.GetOrdinal("Content")),
                            Category = reader.GetString(reader.GetOrdinal("Category")),
                            SourceUrl = await reader.IsDBNullAsync(sourceUrlOrdinal, cancellationToken) ? null : reader.GetString(sourceUrlOrdinal),
                            IsActive = reader.GetBoolean(reader.GetOrdinal("IsActive")),
                            CreatedAt = reader.GetDateTime(reader.GetOrdinal("DocCreatedAt")),
                            UpdatedAt = await reader.IsDBNullAsync(docUpdatedAtOrdinal, cancellationToken) ? null : reader.GetDateTime(docUpdatedAtOrdinal),
                            DeletedAt = await reader.IsDBNullAsync(docDeletedAtOrdinal, cancellationToken) ? null : reader.GetDateTime(docDeletedAtOrdinal)
                        }
                    };

                    results.Add((chunk, similarity));
                    _logger.LogDebug("Found chunk with distance={Distance}, similarity={Similarity}", distance, similarity);
                }

                _logger.LogWarning(
                    "RAG SEARCH: Completed. BusinessId={BusinessId}, ResultCount={Count}, BestSimilarity={Best:F3}",
                    businessId, results.Count, results.Count > 0 ? results.Max(r => r.similarity) : 0f);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ADO.NET vector search failed: BusinessId={BusinessId}", businessId);
                throw;
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error during vector similarity search: BusinessId={BusinessId}",
                businessId);

            // Return empty results to allow graceful degradation
            return Enumerable.Empty<(KnowledgeBaseChunk chunk, float similarity)>();
        }
    }

    /// <inheritdoc />
    public async Task<IEnumerable<KnowledgeBaseChunk>> GetDocumentChunksAsync(
        Guid businessId,
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.KnowledgeBaseChunks
            .Include(c => c.Document)
            .Where(c => c.Document.BusinessId == businessId && c.DocumentId == documentId)
            .OrderBy(c => c.ChunkIndex)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddChunksAsync(IEnumerable<KnowledgeBaseChunk> chunks, CancellationToken cancellationToken = default)
    {
        await _context.KnowledgeBaseChunks.AddRangeAsync(chunks, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteDocumentChunksAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default)
    {
        var chunks = await _context.KnowledgeBaseChunks
            .Include(c => c.Document)
            .Where(c => c.Document.BusinessId == businessId && c.DocumentId == documentId)
            .ToListAsync(cancellationToken);

        _context.KnowledgeBaseChunks.RemoveRange(chunks);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// DTO for mapping raw SQL vector search results.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1812:Avoid uninstantiated internal classes", Justification = "Instantiated by EF Core SqlQueryRaw")]
    [System.Diagnostics.CodeAnalysis.SuppressMessage("CodeQuality", "S1144:Remove the unused private set accessor", Justification = "Init-only properties are used by EF Core SqlQueryRaw for object initialization")]
    [System.Diagnostics.CodeAnalysis.SuppressMessage("CodeQuality", "S3459:Remove unassigned auto-property", Justification = "Init-only properties are assigned by EF Core SqlQueryRaw during raw SQL query mapping")]
    private sealed class VectorSearchResult
    {
        public Guid Id { get; init; }
        public Guid BusinessId { get; init; }
        public Guid DocumentId { get; init; }
        public string ChunkText { get; init; } = string.Empty;
        public int ChunkIndex { get; init; }
        public int TokenCount { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public DateTime? DeletedAt { get; init; }
        public Guid DocId { get; init; }
        public Guid DocBusinessId { get; init; }
        public string Title { get; init; } = string.Empty;
        public string Content { get; init; } = string.Empty;
        public string Category { get; init; } = string.Empty;
        public string? SourceUrl { get; init; }
        public bool IsActive { get; init; }
        public DateTime DocCreatedAt { get; init; }
        public DateTime DocUpdatedAt { get; init; }
        public DateTime? DocDeletedAt { get; init; }
        public float Distance { get; init; }
    }
}
