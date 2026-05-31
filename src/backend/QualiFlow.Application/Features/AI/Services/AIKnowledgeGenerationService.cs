// -----------------------------------------------------------------------
// <copyright file="AIKnowledgeGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for AI-powered knowledge base content generation.
/// </summary>
/// <param name="openAIService">OpenAI service for AI completions.</param>
/// <param name="modelSelector">AI model selector for task-appropriate models.</param>
/// <param name="auditService">Service for logging AI generations.</param>
/// <param name="usageLimitService">Service for checking usage limits.</param>
/// <param name="usageTrackingService">Service for tracking external usage.</param>
/// <param name="knowledgeBaseRepository">Knowledge base repository for storage.</param>
/// <param name="conversationRepository">Conversation repository for FAQ extraction.</param>
/// <param name="logger">Logger instance.</param>
public sealed partial class AIKnowledgeGenerationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    IBusinessKnowledgeBaseRepository knowledgeBaseRepository,
    IConversationRepository conversationRepository,
    ILogger<AIKnowledgeGenerationService> logger) : IAIKnowledgeGenerationService
{
    private const string ArticleSystemPrompt = """
        You are a technical writer creating knowledge base content.
        Generate well-structured, informative content in markdown format.
        
        REQUIREMENTS:
        - Use clear headings and subheadings
        - Include practical examples where applicable
        - Keep language accessible but professional
        - Focus on accuracy and helpfulness
        
        RESPONSE FORMAT (JSON):
        {
          "title": "Clear, descriptive title",
          "content": "Full markdown content with ## headings",
          "suggestedTags": ["tag1", "tag2"],
          "suggestedKeywords": ["keyword1", "keyword2"],
          "relatedFaqs": [
            {"question": "Common question?", "answer": "Answer text", "confidence": 85}
          ]
        }
        """;

    private const string FaqExtractionSystemPrompt = """
        You are an expert at analyzing customer conversations to identify common questions.
        Extract frequently asked questions and provide comprehensive answers.
        
        REQUIREMENTS:
        - Identify recurring themes and questions
        - Combine similar questions into single FAQs
        - Provide complete, helpful answers
        - Rate confidence based on frequency and clarity (0-100)
        
        RESPONSE FORMAT (JSON array):
        [
          {
            "question": "What is the question?",
            "answer": "Complete answer text",
            "category": "Optional category",
            "confidence": 85
          }
        ]
        """;

    /// <inheritdoc />
    public async Task<KnowledgeArticleResult> GenerateArticleAsync(
        Guid businessId,
        KnowledgeGenerationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogArticleGenerationStarted(businessId, request.Topic, request.EntryType.ToString());
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(businessId);
                return new KnowledgeArticleResult { Success = false, ErrorMessage = "AI limit exceeded.", LimitExceeded = true };
            }

            // Build user prompt
            var userPrompt = BuildArticlePrompt(request);

            // Get model selection (gpt-5-mini for knowledge generation)
            var modelSelection = modelSelector.SelectModel(AITaskType.KnowledgeGeneration, businessId);

            // Generate article using AI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                ArticleSystemPrompt,
                maxTokens: 2000,
                temperature: 0.7f,
                cancellationToken);

            stopwatch.Stop();
            var durationMs = (int)stopwatch.ElapsedMilliseconds;

            // Parse response
            var parsed = ParseArticleResponse(aiResponse, request.GenerateRelatedFaqs, request.MaxRelatedFaqs);
            if (parsed == null)
            {
                LogParsingFailed(businessId);
                return new KnowledgeArticleResult { Success = false, ErrorMessage = "Failed to parse AI response." };
            }

            // Estimate tokens
            var inputTokens = userPrompt.Length / 4;
            var outputTokens = aiResponse.Length / 4;

            // Calculate estimated cost
            var estimatedCost = ((inputTokens * modelSelection.EstimatedInputCostPer1K) +
                                 (outputTokens * modelSelection.EstimatedOutputCostPer1K)) / 1000m;

            // Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "knowledge_generation",
                durationMs: durationMs,
                cancellationToken: cancellationToken);

            // Log audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = businessId,
                    TaskType = AITaskType.KnowledgeGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = durationMs,
                    EstimatedCostUsd = estimatedCost,
                },
                cancellationToken);

            LogArticleGenerationCompleted(businessId, stopwatch.ElapsedMilliseconds);

            return parsed with
            {
                AuditId = auditResult.AuditId,
                TokensUsed = inputTokens + outputTokens,
                GeneratedAt = DateTime.UtcNow,
                Category = request.Category,
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogArticleGenerationError(businessId, ex.Message);
            return new KnowledgeArticleResult { Success = false, ErrorMessage = $"Generation failed: {ex.Message}" };
        }
    }

    /// <inheritdoc />
    public async Task<ExtractFaqsResult> ExtractFaqsFromConversationsAsync(
        Guid businessId,
        ExtractFaqsRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogFaqExtractionStarted(businessId, request.DaysToAnalyze);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(businessId);
                return new ExtractFaqsResult { Success = false, ErrorMessage = "AI limit exceeded.", LimitExceeded = true };
            }

            // Get recent conversations
            var since = DateTime.UtcNow.AddDays(-request.DaysToAnalyze);
            var conversations = await conversationRepository.GetRecentWithMessagesAsync(
                businessId, since, limit: 50, cancellationToken);

            if (conversations.Count == 0)
            {
                return new ExtractFaqsResult
                {
                    Success = true,
                    Faqs = [],
                    ConversationsAnalyzed = 0,
                    ExtractedAt = DateTime.UtcNow,
                };
            }

            // Build conversation summary for analysis
            var conversationSummary = BuildConversationSummary(conversations);

            // Get model selection
            var modelSelection = modelSelector.SelectModel(AITaskType.KnowledgeGeneration, businessId);

            // Extract FAQs using AI
            var userPrompt = $"""
                Analyze these customer conversations and extract the {request.MaxFaqs} most common questions.
                Only include FAQs with confidence >= {request.MinConfidence}.
                {(request.CategoryFilter != null ? $"Focus on category: {request.CategoryFilter}" : string.Empty)}

                CONVERSATIONS:
                {conversationSummary}
                """;

            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                FaqExtractionSystemPrompt,
                maxTokens: 2000,
                temperature: 0.5f,
                cancellationToken);

            stopwatch.Stop();
            var durationMs = (int)stopwatch.ElapsedMilliseconds;

            // Parse response
            var faqs = ParseFaqResponse(aiResponse, request.MinConfidence);

            // Estimate tokens
            var inputTokens = userPrompt.Length / 4;
            var outputTokens = aiResponse.Length / 4;

            // Calculate estimated cost
            var estimatedCost = ((inputTokens * modelSelection.EstimatedInputCostPer1K) +
                                 (outputTokens * modelSelection.EstimatedOutputCostPer1K)) / 1000m;

            // Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "faq_extraction",
                durationMs: durationMs,
                cancellationToken: cancellationToken);

            // Log audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = businessId,
                    TaskType = AITaskType.KnowledgeGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = durationMs,
                    EstimatedCostUsd = estimatedCost,
                },
                cancellationToken);

            LogFaqExtractionCompleted(businessId, faqs.Count, durationMs);

            return new ExtractFaqsResult
            {
                Success = true,
                Faqs = faqs,
                ConversationsAnalyzed = conversations.Count,
                AuditId = auditResult.AuditId,
                TokensUsed = inputTokens + outputTokens,
                ExtractedAt = DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogFaqExtractionError(businessId, ex.Message);
            return new ExtractFaqsResult { Success = false, ErrorMessage = $"Extraction failed: {ex.Message}" };
        }
    }

    /// <inheritdoc />
    public async Task<Guid> SaveArticleAsync(
        Guid businessId,
        KnowledgeArticleResult article,
        KnowledgeEntryType entryType,
        CancellationToken cancellationToken = default)
    {
        var entry = new BusinessKnowledgeBase
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            EntryType = entryType,
            Title = article.Title,
            Content = article.Content,
            Category = article.Category,
            Tags = article.SuggestedTags.Count > 0 ? string.Join(",", article.SuggestedTags) : null,
            Keywords = article.SuggestedKeywords.Count > 0 ? string.Join(",", article.SuggestedKeywords) : null,
            Priority = 50,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await knowledgeBaseRepository.CreateAsync(entry, cancellationToken);
        LogArticleSaved(businessId, entry.Id);

        return entry.Id;
    }

    /// <inheritdoc />
    public async Task<int> SaveFaqsAsync(
        Guid businessId,
        IReadOnlyList<FaqSuggestion> faqs,
        CancellationToken cancellationToken = default)
    {
        var savedCount = 0;

        foreach (var faq in faqs)
        {
            var entry = new BusinessKnowledgeBase
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                EntryType = KnowledgeEntryType.FAQ,
                Title = faq.Question,
                Content = faq.Answer,
                Category = faq.Category,
                Priority = faq.Confidence,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            await knowledgeBaseRepository.CreateAsync(entry, cancellationToken);
            savedCount++;
        }

        LogFaqsSaved(businessId, savedCount);
        return savedCount;
    }

    // ========================================================================
    // Private Helper Methods
    // ========================================================================

    private static string BuildArticlePrompt(KnowledgeGenerationRequest request)
    {
        var prompt = $"""
            Generate a knowledge base article about: {request.Topic}

            Entry Type: {request.EntryType}
            Tone: {request.Tone}
            """;

        if (!string.IsNullOrEmpty(request.Context))
        {
            prompt += $"\n\nAdditional Context:\n{request.Context}";
        }

        if (request.Keywords?.Count > 0)
        {
            prompt += $"\n\nInclude these keywords: {string.Join(", ", request.Keywords)}";
        }

        if (request.GenerateRelatedFaqs)
        {
            prompt += $"\n\nAlso generate up to {request.MaxRelatedFaqs} related FAQs.";
        }

        return prompt;
    }

    private static string BuildConversationSummary(IReadOnlyList<Conversation> conversations)
    {
        var summaries = new List<string>();

        foreach (var conv in conversations.Take(30))
        {
            var messages = conv.Messages?.OrderBy(m => m.CreatedAt).Take(10).ToList() ?? [];
            if (messages.Count == 0)
            {
                continue;
            }

            var messageTexts = messages.Select(m =>
            {
                var sender = m.Direction == MessageDirection.Inbound ? "Customer" : "Agent";
                var content = m.Content ?? string.Empty;
                var truncated = content.Length > 200 ? content[..200] + "..." : content;
                return $"[{sender}]: {truncated}";
            });
            summaries.Add($"--- Conversation ---\n{string.Join("\n", messageTexts)}");
        }

        return string.Join("\n\n", summaries);
    }

    private static KnowledgeArticleResult? ParseArticleResponse(string response, bool includeRelatedFaqs, int maxFaqs)
    {
        try
        {
            // Extract JSON from response
            var jsonStart = response.IndexOf('{', StringComparison.Ordinal);
            var jsonEnd = response.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < 0)
            {
                return null;
            }

            var json = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var relatedFaqs = new List<FaqSuggestion>();
            if (includeRelatedFaqs && root.TryGetProperty("relatedFaqs", out var faqsElement))
            {
                foreach (var faqEl in faqsElement.EnumerateArray().Take(maxFaqs))
                {
                    relatedFaqs.Add(new FaqSuggestion
                    {
                        Question = faqEl.GetProperty("question").GetString() ?? string.Empty,
                        Answer = faqEl.GetProperty("answer").GetString() ?? string.Empty,
                        Confidence = faqEl.TryGetProperty("confidence", out var conf) ? conf.GetInt32() : 80,
                        Source = "ai_generated",
                    });
                }
            }

            return new KnowledgeArticleResult
            {
                Success = true,
                Title = root.GetProperty("title").GetString() ?? string.Empty,
                Content = root.GetProperty("content").GetString() ?? string.Empty,
                SuggestedTags = ParseStringArray(root, "suggestedTags"),
                SuggestedKeywords = ParseStringArray(root, "suggestedKeywords"),
                RelatedFaqs = relatedFaqs,
            };
        }
        catch
        {
            return null;
        }
    }

    private static List<FaqSuggestion> ParseFaqResponse(string response, int minConfidence)
    {
        try
        {
            // Extract JSON array from response
            var jsonStart = response.IndexOf('[', StringComparison.Ordinal);
            var jsonEnd = response.LastIndexOf(']');
            if (jsonStart < 0 || jsonEnd < 0)
            {
                return [];
            }

            var json = response.Substring(jsonStart, jsonEnd - jsonStart + 1);
            using var doc = JsonDocument.Parse(json);

            var faqs = new List<FaqSuggestion>();
            foreach (var el in doc.RootElement.EnumerateArray())
            {
                var confidence = el.TryGetProperty("confidence", out var conf) ? conf.GetInt32() : 80;
                if (confidence < minConfidence)
                {
                    continue;
                }

                faqs.Add(new FaqSuggestion
                {
                    Question = el.GetProperty("question").GetString() ?? string.Empty,
                    Answer = el.GetProperty("answer").GetString() ?? string.Empty,
                    Category = el.TryGetProperty("category", out var cat) ? cat.GetString() : null,
                    Confidence = confidence,
                    Source = "extracted_from_conversations",
                });
            }

            return faqs;
        }
        catch
        {
            return [];
        }
    }

    private static List<string> ParseStringArray(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var arrayEl))
        {
            return [];
        }

        return arrayEl.EnumerateArray()
            .Select(e => e.GetString())
            .Where(s => !string.IsNullOrEmpty(s))
            .Cast<string>()
            .ToList();
    }

    // ========================================================================
    // Logging
    // ========================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting article generation for business {BusinessId}: topic={Topic}, type={EntryType}")]
    private partial void LogArticleGenerationStarted(Guid businessId, string topic, string entryType);

    [LoggerMessage(Level = LogLevel.Information, Message = "Article generation completed for business {BusinessId} in {DurationMs}ms")]
    private partial void LogArticleGenerationCompleted(Guid businessId, long durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "Article generation failed for business {BusinessId}: {Error}")]
    private partial void LogArticleGenerationError(Guid businessId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting FAQ extraction for business {BusinessId}: days={DaysToAnalyze}")]
    private partial void LogFaqExtractionStarted(Guid businessId, int daysToAnalyze);

    [LoggerMessage(Level = LogLevel.Information, Message = "FAQ extraction completed for business {BusinessId}: {FaqCount} FAQs in {DurationMs}ms")]
    private partial void LogFaqExtractionCompleted(Guid businessId, int faqCount, long durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "FAQ extraction failed for business {BusinessId}: {Error}")]
    private partial void LogFaqExtractionError(Guid businessId, string error);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for business {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse AI response for business {BusinessId}")]
    private partial void LogParsingFailed(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Saved article {ArticleId} for business {BusinessId}")]
    private partial void LogArticleSaved(Guid businessId, Guid articleId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Saved {Count} FAQs for business {BusinessId}")]
    private partial void LogFaqsSaved(Guid businessId, int count);
}

