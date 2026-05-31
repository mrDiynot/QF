// -----------------------------------------------------------------------
// <copyright file="AIQuickReplySuggestionService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for generating AI-powered quick reply suggestions.
/// Uses gpt-4o-mini for fast response times.
/// </summary>
public sealed partial class AIQuickReplySuggestionService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    IBusinessKnowledgeBaseRepository knowledgeRepository,
    ILogger<AIQuickReplySuggestionService> logger) : IAIQuickReplySuggestionService
{
    private const string SystemPromptText = """
        You are a helpful customer service assistant generating quick reply suggestions.
        Based on the customer's message and conversation context, generate contextual reply options.

        Requirements:
        - Generate concise, professional replies (1-3 sentences max)
        - Match the tone to the conversation context
        - Include a mix of: acknowledgment, answer, follow-up question
        - One reply should be a potential closing/resolution option if appropriate
        - Each reply should address the customer's needs directly

        Return JSON in this exact format:
        {
            "suggestions": [
                {
                    "text": "The reply message text",
                    "confidence": 85,
                    "category": "acknowledgment|answer|question|closing",
                    "tone": "friendly|professional|empathetic",
                    "isClosing": false,
                    "rationale": "Brief explanation"
                }
            ]
        }
        """;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    /// <inheritdoc/>
    public async Task<QuickReplySuggestionResult> GenerateSuggestionsAsync(
        QuickReplySuggestionRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Check usage limits
            var canUseAi = await usageLimitService.CanUseAiInteractionAsync(
                request.BusinessId, cancellationToken);

            if (!canUseAi)
            {
                LogLimitExceeded(request.BusinessId);
                return QuickReplySuggestionResult.Failed(
                    "AI usage limit exceeded for quick reply suggestions.",
                    limitExceeded: true);
            }

            // Get business knowledge for context
            var knowledge = await knowledgeRepository.GetForAIContextAsync(
                request.BusinessId, maxEntries: 3, cancellationToken);
            var knowledgeContext = knowledge.Count > 0
                ? $"\nBusiness Knowledge:\n{string.Join("\n", knowledge.Select(k => $"- {k.Title}: {k.Content[..Math.Min(200, k.Content.Length)]}"))}"
                : string.Empty;

            // Build user prompt
            var userPrompt = BuildUserPrompt(request, knowledgeContext);

            // Get model for quick replies (using nano for speed)
            var modelSelection = modelSelector.SelectModel(AITaskType.QuickReplyGeneration);

            LogGeneratingSuggestions(request.BusinessId, request.ConversationId, modelSelection.Model);

            // Generate suggestions using AI
            var response = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPromptText,
                maxTokens: 500,
                temperature: 0.7f,
                cancellationToken);

            stopwatch.Stop();

            // Parse response
            var suggestions = ParseSuggestions(response, request.SuggestionCount);

            // Track usage
            var inputTokens = userPrompt.Length / 4;
            var outputTokens = response.Length / 4;
            var tokensUsed = inputTokens + outputTokens;
            await usageTrackingService.TrackOpenAIUsageAsync(
                request.BusinessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "quick_reply_generation",
                request.ConversationId,
                null,
                stopwatch.ElapsedMilliseconds,
                cancellationToken);

            // Audit the generation
            var auditResponse = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = null,
                    TaskType = AITaskType.QuickReplyGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = response,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    EstimatedCostUsd = 0.0001m * tokensUsed,
                    IsSuccess = true,
                },
                cancellationToken);

            await usageLimitService.IncrementAiInteractionsAsync(request.BusinessId, cancellationToken);

            LogSuggestionsGenerated(request.BusinessId, suggestions.Count, stopwatch.ElapsedMilliseconds);

            return new QuickReplySuggestionResult
            {
                Success = true,
                Suggestions = suggestions,
                AuditId = auditResponse.AuditId,
                TokensUsed = tokensUsed,
                GenerationTimeMs = (int)stopwatch.ElapsedMilliseconds,
                GeneratedAt = DateTime.UtcNow,
            };
        }
        catch (Exception ex)
        {
            LogGenerationError(request.BusinessId, ex.Message);
            return QuickReplySuggestionResult.Failed($"Failed to generate suggestions: {ex.Message}");
        }
    }

    private static string BuildUserPrompt(QuickReplySuggestionRequest request, string knowledgeContext)
    {
        var historyContext = request.ConversationHistory?.Count > 0
            ? $"\nRecent conversation:\n{string.Join("\n", request.ConversationHistory.TakeLast(5))}"
            : string.Empty;

        var intentContext = !string.IsNullOrEmpty(request.DetectedIntent)
            ? $"\nDetected intent: {request.DetectedIntent}"
            : string.Empty;

        var sentimentContext = !string.IsNullOrEmpty(request.DetectedSentiment)
            ? $"\nDetected sentiment: {request.DetectedSentiment}"
            : string.Empty;

        return $"""
            Customer's message: "{request.LastMessage}"
            {historyContext}
            {intentContext}
            {sentimentContext}
            {knowledgeContext}

            Generate {request.SuggestionCount} quick reply suggestions for the agent to respond with.
            """;
    }

    private static IReadOnlyList<QuickReplySuggestion> ParseSuggestions(string response, int maxCount)
    {
        try
        {
            // Extract JSON from response
            var jsonStart = response.IndexOf('{', StringComparison.Ordinal);
            var jsonEnd = response.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < 0)
            {
                return GenerateFallbackSuggestions();
            }

            var json = response[jsonStart..(jsonEnd + 1)];
            var parsed = JsonSerializer.Deserialize<SuggestionsResponse>(json, JsonOptions);

            return parsed?.Suggestions?
                .Take(maxCount)
                .Select(s => new QuickReplySuggestion
                {
                    Text = s.Text ?? string.Empty,
                    Confidence = Math.Clamp(s.Confidence, 0, 100),
                    Category = s.Category,
                    Tone = s.Tone ?? "professional",
                    IsClosing = s.IsClosing,
                    Rationale = s.Rationale,
                })
                .ToList() ?? GenerateFallbackSuggestions();
        }
        catch (JsonException)
        {
            return GenerateFallbackSuggestions();
        }
    }

    private static IReadOnlyList<QuickReplySuggestion> GenerateFallbackSuggestions() =>
    [
        new() { Text = "Thank you for reaching out! How can I help you today?", Confidence = 70, Category = "acknowledgment", Tone = "friendly" },
        new() { Text = "I understand. Let me look into that for you.", Confidence = 65, Category = "acknowledgment", Tone = "professional" },
        new() { Text = "Could you provide more details about your request?", Confidence = 60, Category = "question", Tone = "professional" },
    ];

    [LoggerMessage(Level = LogLevel.Information, Message = "Generating quick reply suggestions for business {BusinessId}, conversation {ConversationId} using model {Model}")]
    private partial void LogGeneratingSuggestions(Guid businessId, Guid conversationId, string model);

    [LoggerMessage(Level = LogLevel.Information, Message = "Generated {Count} quick reply suggestions for business {BusinessId} in {ElapsedMs}ms")]
    private partial void LogSuggestionsGenerated(Guid businessId, int count, long elapsedMs);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Quick reply suggestion limit exceeded for business {BusinessId}")]
    private partial void LogLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error generating quick reply suggestions for business {BusinessId}: {ErrorMessage}")]
    private partial void LogGenerationError(Guid businessId, string errorMessage);

    // JSON deserialization types - suppressing analyzer warnings as these are instantiated by JsonSerializer
#pragma warning disable S3459, S1144, CA1812
    private sealed class SuggestionsResponse
    {
        public List<SuggestionItem>? Suggestions { get; set; }
    }

    private sealed class SuggestionItem
    {
        public string? Text { get; set; }
        public int Confidence { get; set; }
        public string? Category { get; set; }
        public string? Tone { get; set; }
        public bool IsClosing { get; set; }
        public string? Rationale { get; set; }
    }
#pragma warning restore S3459, S1144, CA1812
}

