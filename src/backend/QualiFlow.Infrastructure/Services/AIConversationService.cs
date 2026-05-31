// -----------------------------------------------------------------------
// <copyright file="AIConversationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// AI Conversation Service implementation for lead qualification and conversation analysis.
/// Uses OpenAI via IOpenAIService and caches results for performance.
/// </summary>
public sealed partial class AIConversationService : IAIConversationService
{
    private const int CacheExpirationMinutes = 5;
    private const string QualificationCachePrefix = "qualification_";
    private const string AnalysisCachePrefix = "analysis_";

    private readonly IOpenAIService _openAIService;
    private readonly IConversationRepository _conversationRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IMemoryCache _cache;
    private readonly ILogger<AIConversationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIConversationService"/> class.
    /// </summary>
    /// <param name="openAIService">The OpenAI service.</param>
    /// <param name="conversationRepository">The conversation repository.</param>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="cache">The memory cache.</param>
    /// <param name="logger">The logger.</param>
    public AIConversationService(
        IOpenAIService openAIService,
        IConversationRepository conversationRepository,
        ILeadRepository leadRepository,
        IMemoryCache cache,
        ILogger<AIConversationService> logger)
    {
        _openAIService = openAIService;
        _conversationRepository = conversationRepository;
        _leadRepository = leadRepository;
        _cache = cache;
        _logger = logger;

        LogServiceInitialized();
    }

    /// <inheritdoc />
    public async Task<QualifyLeadResponse> QualifyLeadAsync(
        QualifyLeadRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var cacheKey = $"{QualificationCachePrefix}{request.LeadId}";

        // Check cache if not forcing re-qualification
        if (!request.ForceRequalify && _cache.TryGetValue(cacheKey, out QualifyLeadResponse? cachedResult))
        {
            LogCacheHit(request.LeadId, "qualification");
            return cachedResult! with { FromCache = true };
        }

        LogQualifyingLead(request.LeadId, request.BusinessId);

        // Get lead data
        var lead = await _leadRepository.GetByIdAsync(request.LeadId, cancellationToken);
        if (lead == null)
        {
            throw new InvalidOperationException($"Lead with ID {request.LeadId} not found.");
        }

        // Get conversation with messages
        var conversation = await GetConversationForQualificationAsync(
            request.BusinessId,
            request.LeadId,
            request.ConversationId,
            cancellationToken);

        // Build qualification request for OpenAI
        var openAIRequest = BuildQualificationRequest(lead, conversation);

        // Call OpenAI for qualification
        var startTime = DateTime.UtcNow;
        var qualificationResult = await _openAIService.QualifyLeadAsync(openAIRequest, cancellationToken);
        var latencyMs = (DateTime.UtcNow - startTime).TotalMilliseconds;

        LogQualificationComplete(request.LeadId, qualificationResult.Score, latencyMs);

        // Build response
        var response = BuildQualifyLeadResponse(request.LeadId, qualificationResult);

        // Cache the result
        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(CacheExpirationMinutes));

        return response;
    }

    /// <inheritdoc />
    public async Task<ConversationAnalysisResponse> AnalyzeConversationAsync(
        Guid conversationId,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{AnalysisCachePrefix}{conversationId}";

        // Check cache
        if (_cache.TryGetValue(cacheKey, out ConversationAnalysisResponse? cachedResult))
        {
            LogCacheHit(conversationId, "analysis");
            return cachedResult!;
        }

        LogAnalyzingConversation(conversationId, businessId);

        // Get conversation with messages
        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            throw new InvalidOperationException($"Conversation with ID {conversationId} not found.");
        }

        // Analyze messages
        var messages = conversation.Messages.OrderBy(m => m.SentAt).ToList();
        var combinedText = string.Join("\n", messages.Select(m => m.Content));

        // Get intent and sentiment from OpenAI
        var intentTask = _openAIService.DetectIntentAsync(
            combinedText,
            messages.Take(5).Select(m => m.Content),
            cancellationToken);

        var sentimentTask = _openAIService.AnalyzeSentimentAsync(combinedText, cancellationToken);

        await Task.WhenAll(intentTask, sentimentTask);

        var intentResult = await intentTask;
        var sentimentResult = await sentimentTask;

        // Build response
        var response = new ConversationAnalysisResponse
        {
            ConversationId = conversationId,
            LeadId = conversation.LeadId,
            PrimaryIntent = intentResult.PrimaryIntent,
            IntentConfidence = intentResult.Confidence,
            Sentiment = sentimentResult.Sentiment,
            SentimentScore = sentimentResult.Score,
            KeyTopics = ExtractKeyTopics(intentResult),
            ExtractedEntities = intentResult.ExtractedEntities,
            PainPoints = ExtractPainPoints(messages),
            MessageCount = messages.Count,
            AnalyzedAt = DateTime.UtcNow,
        };

        // Cache result
        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(CacheExpirationMinutes));

        LogAnalysisComplete(conversationId, messages.Count);

        return response;
    }

    /// <inheritdoc />
    public async Task<SuggestedResponseResult> GenerateSuggestedResponseAsync(
        Guid conversationId,
        Guid businessId,
        string? tone = null,
        CancellationToken cancellationToken = default)
    {
        LogGeneratingSuggestion(conversationId, businessId);

        // Get conversation
        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            throw new InvalidOperationException($"Conversation with ID {conversationId} not found.");
        }

        var messages = conversation.Messages.OrderBy(m => m.SentAt).ToList();
        var lastMessage = messages.LastOrDefault();

        if (lastMessage == null)
        {
            throw new InvalidOperationException("Conversation has no messages.");
        }

        // Build prompt for response suggestion
        var resolvedTone = tone ?? "professional";
        var prompt = BuildSuggestionPrompt(messages, resolvedTone);

        var startTime = DateTime.UtcNow;
        var suggestion = await _openAIService.GenerateCompletionAsync(
            prompt,
            GetSuggestionSystemMessage(resolvedTone),
            maxTokens: 500,
            temperature: 0.7f,
            cancellationToken: cancellationToken);
        var latencyMs = (DateTime.UtcNow - startTime).TotalMilliseconds;

        LogSuggestionGenerated(conversationId, latencyMs);

        return new SuggestedResponseResult
        {
            ConversationId = conversationId,
            SuggestedResponse = suggestion.Trim(),
            Confidence = 0.85f,
            Tone = resolvedTone,
            GeneratedAt = DateTime.UtcNow,
        };
    }

    /// <inheritdoc />
    public Task<AIUsageMetrics> GetUsageMetricsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        LogGettingUsageMetrics(businessId, startDate, endDate);

        // NOTE: In a full implementation, this would query a metrics database/table
        // For now, returning placeholder metrics
        var metrics = new AIUsageMetrics
        {
            BusinessId = businessId,
            StartDate = startDate,
            EndDate = endDate,
            TotalQualifications = 0,
            TotalAnalyses = 0,
            TotalSuggestions = 0,
            TotalTokensUsed = 0,
            InputTokens = 0,
            OutputTokens = 0,
            EstimatedCostUsd = 0m,
            AverageLatencyMs = 0,
            SuccessRate = 1.0f,
        };

        return Task.FromResult(metrics);
    }

    // ============================================================================
    // Private Static Helper Methods (must appear before non-static per SA1204)
    // ============================================================================

    private static LeadQualificationRequest BuildQualificationRequest(Lead lead, Conversation conversation)
    {
        var conversationHistory = conversation.Messages
            .OrderBy(m => m.SentAt)
            .Select(m => new ConversationMessage
            {
                Content = m.Content,
                IsFromLead = m.Direction == MessageDirection.Inbound,
                Timestamp = m.SentAt,
            })
            .ToList();

        // Default scoring criteria (in a full implementation, this would come from business settings)
        var scoringCriteria = new List<ScoringCriterion>
        {
            new() { Name = "Budget", Weight = 25, Description = "Has budget or willingness to invest", ExtractionHint = "Look for budget mentions, price discussions" },
            new() { Name = "Authority", Weight = 25, Description = "Decision-making authority", ExtractionHint = "Look for job title, decision-maker indicators" },
            new() { Name = "Need", Weight = 25, Description = "Clear need or pain point", ExtractionHint = "Look for problems mentioned, requirements stated" },
            new() { Name = "Timeline", Weight = 25, Description = "Ready to buy timeline", ExtractionHint = "Look for urgency, deadline mentions" },
        };

        return new LeadQualificationRequest
        {
            LeadName = lead.Name,
            LeadEmail = lead.Email,
            LeadPhone = lead.Phone,
            ConversationHistory = conversationHistory,
            ScoringCriteria = scoringCriteria,
        };
    }

    private static QualifyLeadResponse BuildQualifyLeadResponse(Guid leadId, LeadQualificationResult result)
    {
        var criterionScores = result.CriterionScores
            .Select(cs => new CriterionScoreDto
            {
                Name = cs.CriterionName,
                Score = cs.Score,
                Weight = 25, // Default weight
                WeightedScore = cs.WeightedScore,
                Evidence = cs.Evidence,
            })
            .ToList();

        return new QualifyLeadResponse
        {
            LeadId = leadId,
            Score = result.Score,
            IsQualified = result.IsQualified,
            Reasoning = result.Reasoning,
            CriterionScores = criterionScores,
            SuggestedActions = result.SuggestedActions,
            Confidence = result.Confidence,
            QualifiedAt = DateTime.UtcNow,
            FromCache = false,
            TokensUsed = 0, // Would track from OpenAI response in full implementation
        };
    }

    private static List<string> ExtractKeyTopics(IntentDetectionResult intentResult)
    {
        var topics = new List<string> { intentResult.PrimaryIntent };

        if (intentResult.SecondaryIntents != null)
        {
            topics.AddRange(intentResult.SecondaryIntents.Select(si => si.Intent));
        }

        return topics;
    }

    private static List<string>? ExtractPainPoints(List<Message> messages)
    {
        // Simple heuristic: look for messages with negative sentiment indicators
        var painPointIndicators = new[] { "problem", "issue", "struggle", "difficult", "help", "need", "frustrated", "concern" };

        var painPoints = messages
            .Where(m => m.Direction == MessageDirection.Inbound)
            .Where(m => Array.Exists(painPointIndicators, indicator =>
                m.Content.Contains(indicator, StringComparison.OrdinalIgnoreCase)))
            .Select(m => m.Content.Length > 100 ? m.Content[..100] + "..." : m.Content)
            .Take(3)
            .ToList();

        return painPoints.Count > 0 ? painPoints : null;
    }

    private static string BuildSuggestionPrompt(List<Message> messages, string tone)
    {
        var conversationContext = string.Join("\n", messages.TakeLast(5).Select(m =>
            $"{(m.Direction == MessageDirection.Inbound ? "Customer" : "Agent")}: {m.Content}"));

        return $"""
            Based on the following conversation, generate a helpful response in a {tone} tone.

            Conversation:
            {conversationContext}

            Generate a response that addresses the customer's needs and moves the conversation forward.
            """;
    }

    private static string GetSuggestionSystemMessage(string tone) =>
        $"You are a helpful customer service agent. Respond in a {tone} manner. Be concise and helpful.";

    // ============================================================================
    // Private Non-Static Helper Methods
    // ============================================================================

    private async Task<Conversation> GetConversationForQualificationAsync(
        Guid businessId,
        Guid leadId,
        Guid? specificConversationId,
        CancellationToken cancellationToken)
    {
        if (specificConversationId.HasValue)
        {
            var conversation = await _conversationRepository.GetByIdAsync(
                businessId,
                specificConversationId.Value,
                cancellationToken);

            if (conversation == null)
            {
                throw new InvalidOperationException($"Conversation {specificConversationId} not found.");
            }

            return conversation;
        }

        // Get most recent conversation for lead
        var conversations = await _conversationRepository.GetAllAsync(
            businessId,
            leadId: leadId,
            skip: 0,
            take: 1,
            cancellationToken: cancellationToken);

        if (conversations.Count == 0)
        {
            throw new InvalidOperationException($"No conversations found for lead {leadId}.");
        }

        return conversations[0];
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "AIConversationService initialized")]
    private partial void LogServiceInitialized();

    [LoggerMessage(Level = LogLevel.Debug, Message = "Cache hit for {EntityId} ({Type})")]
    private partial void LogCacheHit(Guid entityId, string type);

    [LoggerMessage(Level = LogLevel.Information, Message = "Qualifying lead {LeadId} for business {BusinessId}")]
    private partial void LogQualifyingLead(Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Qualification complete for lead {LeadId}: score={Score}, latency={LatencyMs:F0}ms")]
    private partial void LogQualificationComplete(Guid leadId, int score, double latencyMs);

    [LoggerMessage(Level = LogLevel.Information, Message = "Analyzing conversation {ConversationId} for business {BusinessId}")]
    private partial void LogAnalyzingConversation(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Analysis complete for conversation {ConversationId}: {MessageCount} messages analyzed")]
    private partial void LogAnalysisComplete(Guid conversationId, int messageCount);

    [LoggerMessage(Level = LogLevel.Information, Message = "Generating suggestion for conversation {ConversationId} for business {BusinessId}")]
    private partial void LogGeneratingSuggestion(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Suggestion generated for conversation {ConversationId}, latency={LatencyMs:F0}ms")]
    private partial void LogSuggestionGenerated(Guid conversationId, double latencyMs);

    [LoggerMessage(Level = LogLevel.Information, Message = "Getting usage metrics for business {BusinessId} from {StartDate} to {EndDate}")]
    private partial void LogGettingUsageMetrics(Guid businessId, DateTime startDate, DateTime endDate);
}

