// -----------------------------------------------------------------------
// <copyright file="KnowledgeBaseService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text;
using Microsoft.Extensions.Logging;
using Pgvector;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for knowledge base RAG (Retrieval-Augmented Generation).
/// </summary>
public sealed partial class KnowledgeBaseService : IKnowledgeBaseService
{
    private const int DefaultChunkSize = 500;
    private const int ChunkOverlap = 50;
    private const float MinimumSimilarityThreshold = 0.1f; // Lowered from 0.25 to capture more results

    private readonly IKnowledgeBaseRepository _knowledgeBaseRepository;
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<KnowledgeBaseService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="KnowledgeBaseService"/> class.
    /// </summary>
    /// <param name="knowledgeBaseRepository">The knowledge base repository.</param>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="logger">The logger.</param>
    public KnowledgeBaseService(
        IKnowledgeBaseRepository knowledgeBaseRepository,
        IOpenAIService openAIService,
        ILogger<KnowledgeBaseService> logger)
    {
        _knowledgeBaseRepository = knowledgeBaseRepository;
        _openAIService = openAIService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Guid> IndexDocumentAsync(
        Guid businessId,
        string title,
        string content,
        string? category = null,
        IEnumerable<string>? tags = null,
        string? sourceUrl = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        LogIndexingDocument(businessId, title);

        // Create document entity
        var document = new KnowledgeBaseDocument
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Title = title,
            Content = content,
            Category = category ?? "General",
            SourceUrl = sourceUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (tags != null)
        {
            foreach (var tag in tags)
            {
                document.Tags.Add(tag);
            }
        }

        await _knowledgeBaseRepository.AddDocumentAsync(document, cancellationToken);

        // Chunk the content and generate embeddings
        var chunks = ChunkText(content);
        var chunkEntities = new List<KnowledgeBaseChunk>();

        for (int i = 0; i < chunks.Count; i++)
        {
            var chunkContent = chunks[i];
            var embedding = await _openAIService.GenerateEmbeddingAsync(chunkContent, cancellationToken);
            var vector = new Vector(embedding);

            var chunk = new KnowledgeBaseChunk
            {
                Id = Guid.NewGuid(),
                DocumentId = document.Id,
                BusinessId = businessId,
                ChunkText = chunkContent,
                ChunkIndex = i,
                Embedding = vector,
                TokenCount = chunkContent.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            chunkEntities.Add(chunk);
        }

        await _knowledgeBaseRepository.AddChunksAsync(chunkEntities, cancellationToken);

        LogDocumentIndexed(businessId, document.Id, chunkEntities.Count);

        return document.Id;
    }

    /// <inheritdoc />
    public async Task<string> RetrieveRelevantContextAsync(
        Guid businessId,
        string query,
        int maxChunks = 3,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query);

        LogRetrievingContext(businessId, query);
        _logger.LogWarning(
            "RAG RETRIEVAL: Starting for BusinessId={BusinessId}, Query='{Query}'",
            businessId, query.Length > 100 ? query.Substring(0, 100) : query);

        // Generate embedding for the query
        var queryEmbedding = await _openAIService.GenerateEmbeddingAsync(query, cancellationToken);
        var vector = new Vector(queryEmbedding);

        // Search for similar chunks
        var similarChunks = await _knowledgeBaseRepository.SearchSimilarChunksAsync(
            businessId,
            vector,
            limit: maxChunks,
            cancellationToken);

        // Log all similarity scores for debugging
        foreach (var (chunk, similarity) in similarChunks)
        {
            _logger.LogInformation(
                "RAG similarity: {Similarity:F3} for query '{Query}' -> '{Title}'",
                similarity, query.Substring(0, Math.Min(50, query.Length)), chunk.Document.Title);
        }

        var chunks = similarChunks
            .Where(c => c.similarity >= MinimumSimilarityThreshold)
            .ToList();

        if (chunks.Count == 0)
        {
            _logger.LogWarning(
                "No chunks above threshold {Threshold} for business {BusinessId}. Best similarity was {BestSimilarity:F3}",
                MinimumSimilarityThreshold, businessId,
                similarChunks.Any() ? similarChunks.Max(c => c.similarity) : 0);
            LogNoRelevantContext(businessId);
            return string.Empty;
        }

        // Build context from relevant chunks
        var contextBuilder = new StringBuilder();
        contextBuilder.AppendLine("Relevant information from knowledge base:");

        foreach (var (chunk, similarity) in chunks)
        {
            contextBuilder.AppendLine($"\n[Source: {chunk.Document.Title}]");
            contextBuilder.AppendLine(chunk.ChunkText);
        }

        var context = contextBuilder.ToString();
        LogContextRetrieved(businessId, chunks.Count);

        return context;
    }

    /// <inheritdoc />
    public async Task<string> GenerateAugmentedResponseAsync(
        Guid businessId,
        string userQuery,
        string? conversationHistory = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userQuery);

        LogGeneratingAugmentedResponse(businessId, userQuery);

        // Retrieve relevant context from knowledge base
        var knowledgeContext = await RetrieveRelevantContextAsync(businessId, userQuery, cancellationToken: cancellationToken);

        // Build the prompt with RAG context
        var promptBuilder = new StringBuilder();

        if (!string.IsNullOrWhiteSpace(knowledgeContext))
        {
            promptBuilder.AppendLine("Use the following information from our knowledge base to help answer the question:");
            promptBuilder.AppendLine(knowledgeContext);
            promptBuilder.AppendLine();
        }

        if (!string.IsNullOrWhiteSpace(conversationHistory))
        {
            promptBuilder.AppendLine("Previous conversation:");
            promptBuilder.AppendLine(conversationHistory);
            promptBuilder.AppendLine();
        }

        promptBuilder.AppendLine($"User question: {userQuery}");
        promptBuilder.AppendLine();
        promptBuilder.AppendLine("Please provide a helpful, accurate response based on the information above. If the knowledge base doesn't contain relevant information, provide a general helpful response.");

        var systemPrompt = "You are a helpful customer service assistant. Use the provided knowledge base information when relevant, but also draw on your general knowledge to be helpful. Be concise and friendly.";

        var response = await _openAIService.GenerateCompletionAsync(
            promptBuilder.ToString(),
            systemPrompt,
            maxTokens: 500,
            cancellationToken: cancellationToken);

        LogAugmentedResponseGenerated(businessId, response.Length);

        return response;
    }

    /// <inheritdoc />
    public async Task<int> ReindexAllDocumentsAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogReindexingDocuments(businessId);

        var documents = await _knowledgeBaseRepository.GetDocumentsAsync(businessId, cancellationToken: cancellationToken);
        var documentList = documents.ToList();
        int reindexedCount = 0;

        foreach (var document in documentList)
        {
            // Delete existing chunks
            await _knowledgeBaseRepository.DeleteDocumentChunksAsync(businessId, document.Id, cancellationToken);

            // Re-chunk and re-embed
            var chunks = ChunkText(document.Content);
            var chunkEntities = new List<KnowledgeBaseChunk>();

            for (int i = 0; i < chunks.Count; i++)
            {
                var chunkContent = chunks[i];
                var embedding = await _openAIService.GenerateEmbeddingAsync(chunkContent, cancellationToken);
                var vector = new Vector(embedding);

                var chunk = new KnowledgeBaseChunk
                {
                    Id = Guid.NewGuid(),
                    DocumentId = document.Id,
                    BusinessId = businessId,
                    ChunkText = chunkContent,
                    ChunkIndex = i,
                    Embedding = vector,
                    TokenCount = chunkContent.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                chunkEntities.Add(chunk);
            }

            await _knowledgeBaseRepository.AddChunksAsync(chunkEntities, cancellationToken);
            reindexedCount++;
        }

        LogReindexingComplete(businessId, reindexedCount);

        return reindexedCount;
    }

    /// <inheritdoc />
    public async Task DeleteDocumentAsync(Guid businessId, Guid documentId, CancellationToken cancellationToken = default)
    {
        LogDeletingDocument(businessId, documentId);

        await _knowledgeBaseRepository.DeleteDocumentAsync(businessId, documentId, cancellationToken);

        LogDocumentDeleted(businessId, documentId);
    }

    /// <summary>
    /// Chunks text into smaller pieces with overlap for better context preservation.
    /// </summary>
    private static List<string> ChunkText(string text)
    {
        var chunks = new List<string>();
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var currentChunk = new StringBuilder();
        int wordCount = 0;

        int totalWordCount = 0;
        foreach (var word in words)
        {
            currentChunk.Append(word);
            currentChunk.Append(' ');
            wordCount++;
            totalWordCount++;

            // Check if we've reached the chunk size
#pragma warning disable S2583 // Condition can be true after wordCount reset
            if (wordCount >= DefaultChunkSize)
#pragma warning restore S2583
            {
                chunks.Add(currentChunk.ToString().Trim());

                // Start new chunk with overlap
                var overlapWords = words
                    .Skip(Math.Max(0, totalWordCount - ChunkOverlap))
                    .Take(ChunkOverlap);

                currentChunk.Clear();
                currentChunk.Append(string.Join(' ', overlapWords));
                currentChunk.Append(' ');
                wordCount = ChunkOverlap;
            }
        }

        // Add remaining text as final chunk
        if (currentChunk.Length > 0)
        {
            chunks.Add(currentChunk.ToString().Trim());
        }

        return chunks;
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Indexing document for business {BusinessId}: {Title}")]
    private partial void LogIndexingDocument(Guid businessId, string title);

    [LoggerMessage(Level = LogLevel.Information, Message = "Document indexed for business {BusinessId}, ID: {DocumentId}, chunks: {ChunkCount}")]
    private partial void LogDocumentIndexed(Guid businessId, Guid documentId, int chunkCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Retrieving context for business {BusinessId}, query: {Query}")]
    private partial void LogRetrievingContext(Guid businessId, string query);

    [LoggerMessage(Level = LogLevel.Information, Message = "No relevant context found for business {BusinessId}")]
    private partial void LogNoRelevantContext(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Context retrieved for business {BusinessId}, chunks: {ChunkCount}")]
    private partial void LogContextRetrieved(Guid businessId, int chunkCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Generating augmented response for business {BusinessId}, query: {Query}")]
    private partial void LogGeneratingAugmentedResponse(Guid businessId, string query);

    [LoggerMessage(Level = LogLevel.Information, Message = "Augmented response generated for business {BusinessId}, length: {Length}")]
    private partial void LogAugmentedResponseGenerated(Guid businessId, int length);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reindexing all documents for business {BusinessId}")]
    private partial void LogReindexingDocuments(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reindexing complete for business {BusinessId}, documents: {Count}")]
    private partial void LogReindexingComplete(Guid businessId, int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting document for business {BusinessId}, ID: {DocumentId}")]
    private partial void LogDeletingDocument(Guid businessId, Guid documentId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Document deleted for business {BusinessId}, ID: {DocumentId}")]
    private partial void LogDocumentDeleted(Guid businessId, Guid documentId);
}
