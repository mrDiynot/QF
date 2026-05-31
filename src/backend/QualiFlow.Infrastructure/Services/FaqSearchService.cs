// -----------------------------------------------------------------------
// <copyright file="FaqSearchService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using Pgvector;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for semantic FAQ search using vector embeddings.
/// </summary>
public sealed partial class FaqSearchService : IFaqSearchService
{
    private const float DefaultMinSimilarity = 0.4f;

    private readonly IFaqEmbeddingRepository _faqRepository;
    private readonly IOpenAIService _openAIService;
    private readonly ILogger<FaqSearchService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FaqSearchService"/> class.
    /// </summary>
    /// <param name="faqRepository">The FAQ repository.</param>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="logger">The logger.</param>
    public FaqSearchService(
        IFaqEmbeddingRepository faqRepository,
        IOpenAIService openAIService,
        ILogger<FaqSearchService> logger)
    {
        _faqRepository = faqRepository;
        _openAIService = openAIService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<FaqSearchResult?> FindBestMatchAsync(
        Guid businessId,
        string question,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(question);

        LogSearchingFaq(businessId, question);

        // Generate embedding for the question
        var questionEmbedding = await _openAIService.GenerateEmbeddingAsync(question, cancellationToken);
        var vector = new Vector(questionEmbedding);

        // Search for similar FAQs
        var results = await _faqRepository.SearchSimilarAsync(
            businessId,
            vector,
            limit: 1,
            minSimilarity: DefaultMinSimilarity,
            cancellationToken);

        var bestMatch = results.FirstOrDefault();
        if (bestMatch.faq == null)
        {
            LogNoMatchFound(businessId, question);
            return null;
        }

        LogMatchFound(businessId, question, bestMatch.similarity);

        var result = new FaqSearchResult
        {
            Id = bestMatch.faq.Id,
            Question = bestMatch.faq.Question,
            Answer = bestMatch.faq.Answer,
            Category = bestMatch.faq.Category,
            Confidence = bestMatch.similarity
        };

        foreach (var tag in bestMatch.faq.Tags)
        {
            result.Tags.Add(tag);
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FaqSearchResult>> FindSimilarAsync(
        Guid businessId,
        string question,
        int limit = 5,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(question);

        LogSearchingSimilarFaqs(businessId, question, limit);

        // Generate embedding for the question
        var questionEmbedding = await _openAIService.GenerateEmbeddingAsync(question, cancellationToken);
        var vector = new Vector(questionEmbedding);

        // Search for similar FAQs
        var results = await _faqRepository.SearchSimilarAsync(
            businessId,
            vector,
            limit,
            minSimilarity: DefaultMinSimilarity,
            cancellationToken);

        var searchResults = results.Select(r =>
        {
            var result = new FaqSearchResult
            {
                Id = r.faq.Id,
                Question = r.faq.Question,
                Answer = r.faq.Answer,
                Category = r.faq.Category,
                Confidence = r.similarity
            };

            foreach (var tag in r.faq.Tags)
            {
                result.Tags.Add(tag);
            }

            return result;
        }).ToList();

        LogFoundSimilarFaqs(businessId, searchResults.Count);

        return searchResults;
    }

    /// <inheritdoc />
    public async Task<Guid> IndexFaqAsync(
        Guid businessId,
        string question,
        string answer,
        string? category = null,
        IEnumerable<string>? tags = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(question);
        ArgumentException.ThrowIfNullOrWhiteSpace(answer);

        LogIndexingFaq(businessId, question);

        // Generate embedding for the question
        var questionEmbedding = await _openAIService.GenerateEmbeddingAsync(question, cancellationToken);
        var vector = new Vector(questionEmbedding);

        // Create FAQ entity
        var faq = new FaqEmbedding
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Question = question,
            Answer = answer,
            Category = category,
            Embedding = vector,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add tags if provided
        if (tags != null)
        {
            foreach (var tag in tags)
            {
                faq.Tags.Add(tag);
            }
        }

        await _faqRepository.AddAsync(faq, cancellationToken);

        LogFaqIndexed(businessId, faq.Id);

        return faq.Id;
    }

    /// <inheritdoc />
    public async Task<int> ReindexAllAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogReindexingFaqs(businessId);

        var faqs = await _faqRepository.GetByBusinessIdAsync(businessId, cancellationToken);
        var count = 0;

        foreach (var faq in faqs)
        {
            try
            {
                // Regenerate embedding
                var questionEmbedding = await _openAIService.GenerateEmbeddingAsync(faq.Question, cancellationToken);
                faq.Embedding = new Vector(questionEmbedding);
                faq.UpdatedAt = DateTime.UtcNow;

                await _faqRepository.UpdateAsync(faq, cancellationToken);
                count++;
            }
            catch (Exception ex)
            {
                LogReindexError(ex, businessId, faq.Id);
            }
        }

        LogReindexComplete(businessId, count);

        return count;
    }

    // LoggerMessage source generators for high-performance logging
    [LoggerMessage(Level = LogLevel.Information, Message = "Searching FAQ for business {BusinessId}, question: {Question}")]
    private partial void LogSearchingFaq(Guid businessId, string question);

    [LoggerMessage(Level = LogLevel.Information, Message = "No FAQ match found for business {BusinessId}, question: {Question}")]
    private partial void LogNoMatchFound(Guid businessId, string question);

    [LoggerMessage(Level = LogLevel.Information, Message = "FAQ match found for business {BusinessId}, question: {Question}, similarity: {Similarity:F3}")]
    private partial void LogMatchFound(Guid businessId, string question, float similarity);

    [LoggerMessage(Level = LogLevel.Information, Message = "Searching similar FAQs for business {BusinessId}, question: {Question}, limit: {Limit}")]
    private partial void LogSearchingSimilarFaqs(Guid businessId, string question, int limit);

    [LoggerMessage(Level = LogLevel.Information, Message = "Found {Count} similar FAQs for business {BusinessId}")]
    private partial void LogFoundSimilarFaqs(Guid businessId, int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Indexing FAQ for business {BusinessId}, question: {Question}")]
    private partial void LogIndexingFaq(Guid businessId, string question);

    [LoggerMessage(Level = LogLevel.Information, Message = "FAQ indexed for business {BusinessId}, ID: {FaqId}")]
    private partial void LogFaqIndexed(Guid businessId, Guid faqId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reindexing all FAQs for business {BusinessId}")]
    private partial void LogReindexingFaqs(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Reindexing complete for business {BusinessId}, count: {Count}")]
    private partial void LogReindexComplete(Guid businessId, int count);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error reindexing FAQ {FaqId} for business {BusinessId}")]
    private partial void LogReindexError(Exception ex, Guid businessId, Guid faqId);
}
