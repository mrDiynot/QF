// -----------------------------------------------------------------------
// <copyright file="LeadScoringService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Features.Scoring.DTOs;
using QualiFlow.Application.Features.Scoring.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Lead Scoring Service implementation that combines AI and business rules scoring.
/// </summary>
public sealed partial class LeadScoringService : ILeadScoringService
{
    private const string ConfigCachePrefix = "scoring_config_";
    private const int ConfigCacheMinutes = 30;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly IAIConversationService _aiService;
    private readonly ILeadRepository _leadRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IBusinessScoringConfigurationRepository _configRepository;
    private readonly IScoreHistoryRepository _scoreHistoryRepository;
    private readonly IMemoryCache _cache;
    private readonly ILogger<LeadScoringService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadScoringService"/> class.
    /// </summary>
    /// <param name="aiService">The AI conversation service.</param>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="conversationRepository">The conversation repository.</param>
    /// <param name="configRepository">The business scoring configuration repository.</param>
    /// <param name="scoreHistoryRepository">The score history repository.</param>
    /// <param name="cache">The memory cache.</param>
    /// <param name="logger">The logger.</param>
    public LeadScoringService(
        IAIConversationService aiService,
        ILeadRepository leadRepository,
        IConversationRepository conversationRepository,
        IBusinessScoringConfigurationRepository configRepository,
        IScoreHistoryRepository scoreHistoryRepository,
        IMemoryCache cache,
        ILogger<LeadScoringService> logger)
    {
        _aiService = aiService;
        _leadRepository = leadRepository;
        _conversationRepository = conversationRepository;
        _configRepository = configRepository;
        _scoreHistoryRepository = scoreHistoryRepository;
        _cache = cache;
        _logger = logger;

        LogServiceInitialized();
    }

    /// <inheritdoc />
    public async Task<LeadScoreResult> CalculateScoreAsync(
        CalculateScoreRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        LogCalculatingScore(request.LeadId, request.BusinessId);

        // Use business-aware method for background job compatibility
        var lead = await GetLeadForBusinessOrThrowAsync(request.LeadId, request.BusinessId, cancellationToken);
        var previousScore = lead.Score;
        var config = await GetScoringConfigurationAsync(request.BusinessId, cancellationToken);

        // Calculate scores
        var aiScore = request.IncludeAIScoring
            ? await CalculateAIScoreAsync(request, config, cancellationToken)
            : null;
        var rulesScore = CalculateRulesScore(lead, config);

        // Combine and build result
        var (finalScore, factors) = CombineScores(aiScore, rulesScore, config);
        var isQualified = finalScore >= config.QualificationThreshold;
        var recommendedStatus = DetermineStatus(finalScore, config.Thresholds);

        // Update lead if requested
        if (request.UpdateLeadScore)
        {
            await UpdateLeadScoreAsync(lead, finalScore, recommendedStatus, config, cancellationToken, rulesScore);
        }

        // Save score history if requested and score changed
        if (request.SaveToHistory && finalScore != previousScore)
        {
            await SaveScoreHistoryAsync(lead.Id, finalScore, previousScore, factors, cancellationToken);
        }

        LogScoreCalculated(request.LeadId, finalScore, previousScore);

        return BuildScoreResult(request.LeadId, finalScore, previousScore, isQualified, recommendedStatus, factors, aiScore, rulesScore);
    }

    /// <inheritdoc />
    public async Task<LeadScoreResult> RecalculateScoreAsync(
        Guid leadId,
        Guid businessId,
        string trigger,
        CancellationToken cancellationToken = default)
    {
        LogRecalculatingScore(leadId, trigger);

        // Find the most recent conversation for this lead to use for AI scoring
        var conversations = await _conversationRepository.GetAllAsync(businessId, leadId: leadId, skip: 0, take: 1, cancellationToken: cancellationToken);
        var latestConversation = conversations.Count > 0 ? conversations[0] : null;

        var request = new CalculateScoreRequest
        {
            LeadId = leadId,
            BusinessId = businessId,
            ConversationId = latestConversation?.Id,
            IncludeAIScoring = true,
            SaveToHistory = true,
            UpdateLeadScore = true,
        };

        var result = await CalculateScoreAsync(request, cancellationToken);

        return result with { Trigger = trigger };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoreHistoryDto>> GetScoreHistoryAsync(
        Guid leadId,
        Guid businessId,
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        LogGettingScoreHistory(leadId, limit);

        var historyEntries = await _scoreHistoryRepository.GetByLeadIdAsync(leadId, cancellationToken);
        return historyEntries.Take(limit).Select(h => new ScoreHistoryDto
        {
            Id = h.Id,
            LeadId = h.LeadId,
            Score = h.Score,
            PreviousScore = h.PreviousScore,
            ScoreChange = h.ScoreChange,
            Source = h.Source ?? "Unknown",
            Reason = h.Reason,
            ScoredAt = h.ScoredAt,
        }).ToList();
    }

    /// <inheritdoc />
    public async Task<ScoringConfiguration> GetScoringConfigurationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"{ConfigCachePrefix}{businessId}";

        if (_cache.TryGetValue(cacheKey, out ScoringConfiguration? cached))
        {
            return cached!;
        }

        // Load from database
        var dbConfig = await _configRepository.GetOrCreateDefaultAsync(businessId, null, cancellationToken);
        var config = MapToScoringConfiguration(dbConfig);

        _cache.Set(cacheKey, config, TimeSpan.FromMinutes(ConfigCacheMinutes));

        return config;
    }

    /// <inheritdoc />
    public async Task<ScoringConfiguration> UpdateScoringConfigurationAsync(
        Guid businessId,
        ScoringConfiguration configuration,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingConfiguration(businessId);

        // Update in database
        var dbConfig = await _configRepository.GetOrCreateDefaultAsync(businessId, null, cancellationToken);
        dbConfig.QualificationThreshold = configuration.QualificationThreshold;
        dbConfig.AIWeight = configuration.AIWeight;
        dbConfig.RulesWeight = configuration.RulesWeight;
        dbConfig.BudgetWeight = configuration.BantWeights.Budget;
        dbConfig.AuthorityWeight = configuration.BantWeights.Authority;
        dbConfig.NeedWeight = configuration.BantWeights.Need;
        dbConfig.TimelineWeight = configuration.BantWeights.Timeline;
        dbConfig.ContactedThreshold = configuration.Thresholds.Contacted;
        dbConfig.EngagedThreshold = configuration.Thresholds.Engaged;
        dbConfig.QualifiedThreshold = configuration.Thresholds.Qualified;
        dbConfig.OpportunityThreshold = configuration.Thresholds.Opportunity;
        dbConfig.AutoTransitionStatus = configuration.AutoTransitionStatus;

        await _configRepository.UpdateAsync(dbConfig, cancellationToken);

        // Update cache
        var cacheKey = $"{ConfigCachePrefix}{businessId}";
        _cache.Set(cacheKey, configuration, TimeSpan.FromMinutes(ConfigCacheMinutes));

        return configuration;
    }

    // ============================================================================
    // Private Static Helper Methods (must appear before non-static per SA1204)
    // ============================================================================

    private static int NormalizeScore(int score) => Math.Clamp(score, 0, 100);

    private static LeadStatus DetermineStatus(int score, StatusThresholds thresholds)
    {
        return score switch
        {
            _ when score >= thresholds.Opportunity => LeadStatus.Opportunity,
            _ when score >= thresholds.Qualified => LeadStatus.Qualified,
            _ when score >= thresholds.Engaged => LeadStatus.Engaged,
            _ when score >= thresholds.Contacted => LeadStatus.Contacted,
            _ => LeadStatus.New,
        };
    }

    private static (int finalScore, List<ScoringFactor> factors) CombineScores(
        AIScoreComponent? aiScore,
        RulesScoreComponent rulesScore,
        ScoringConfiguration config)
    {
        var factors = new List<ScoringFactor>();
        int finalScore;

        if (aiScore != null)
        {
            var aiWeightedScore = aiScore.Score * config.AIWeight / 100f;
            var rulesWeightedScore = rulesScore.Score * config.RulesWeight / 100f;
            finalScore = NormalizeScore((int)(aiWeightedScore + rulesWeightedScore));

            factors.Add(new ScoringFactor
            {
                Name = "AI Analysis",
                Category = "AI",
                RawScore = aiScore.Score,
                Weight = config.AIWeight,
                WeightedScore = aiWeightedScore,
                Evidence = aiScore.Reasoning,
            });

            factors.Add(new ScoringFactor
            {
                Name = "Business Rules",
                Category = "Rules",
                RawScore = rulesScore.Score,
                Weight = config.RulesWeight,
                WeightedScore = rulesWeightedScore,
            });
        }
        else
        {
            finalScore = rulesScore.Score;
            factors.Add(new ScoringFactor
            {
                Name = "Business Rules",
                Category = "Rules",
                RawScore = rulesScore.Score,
                Weight = 100,
                WeightedScore = rulesScore.Score,
            });
        }

        return (finalScore, factors);
    }

    private static LeadScoreResult BuildScoreResult(
        Guid leadId,
        int finalScore,
        int previousScore,
        bool isQualified,
        LeadStatus recommendedStatus,
        List<ScoringFactor> factors,
        AIScoreComponent? aiScore,
        RulesScoreComponent rulesScore)
    {
        return new LeadScoreResult
        {
            LeadId = leadId,
            FinalScore = finalScore,
            PreviousScore = previousScore,
            ScoreChange = finalScore - previousScore,
            IsQualified = isQualified,
            RecommendedStatus = recommendedStatus,
            Factors = factors,
            AIScore = aiScore,
            RulesScore = rulesScore,
            CalculatedAt = DateTime.UtcNow,
            Trigger = "Manual",
        };
    }

    private static RulesScoreComponent CalculateRulesScore(Lead lead, ScoringConfiguration config)
    {
        var weights = config.BantWeights;

        // Simple heuristic scoring based on lead data
        // In a full implementation, this would use more sophisticated rules
        var budgetScore = lead.Metadata?.Contains("budget", StringComparison.OrdinalIgnoreCase) == true ? 80 : 30;
        var authorityScore = lead.Metadata?.Contains("decision", StringComparison.OrdinalIgnoreCase) == true ? 80 : 40;
        var needScore = lead.Metadata?.Contains("need", StringComparison.OrdinalIgnoreCase) == true ? 80 : 50;
        var timelineScore = lead.Metadata?.Contains("urgent", StringComparison.OrdinalIgnoreCase) == true ? 90 : 40;

        // Calculate weighted score
        var totalScore = (budgetScore * weights.Budget / 100) +
                         (authorityScore * weights.Authority / 100) +
                         (needScore * weights.Need / 100) +
                         (timelineScore * weights.Timeline / 100);

        return new RulesScoreComponent
        {
            Score = NormalizeScore(totalScore),
            BudgetScore = budgetScore,
            AuthorityScore = authorityScore,
            NeedScore = needScore,
            TimelineScore = timelineScore,
            RulesMatched = 4,
        };
    }

    private static ScoringConfiguration MapToScoringConfiguration(BusinessScoringConfiguration dbConfig)
    {
        return new ScoringConfiguration
        {
            BusinessId = dbConfig.BusinessId,
            QualificationThreshold = dbConfig.QualificationThreshold,
            AIWeight = dbConfig.AIWeight,
            RulesWeight = dbConfig.RulesWeight,
            AutoTransitionStatus = dbConfig.AutoTransitionStatus,
            BantWeights = new Application.Features.Scoring.DTOs.BantWeights
            {
                Budget = dbConfig.BudgetWeight,
                Authority = dbConfig.AuthorityWeight,
                Need = dbConfig.NeedWeight,
                Timeline = dbConfig.TimelineWeight,
            },
            Thresholds = new StatusThresholds
            {
                Contacted = dbConfig.ContactedThreshold,
                Engaged = dbConfig.EngagedThreshold,
                Qualified = dbConfig.QualifiedThreshold,
                Opportunity = dbConfig.OpportunityThreshold,
            },
        };
    }

    // ============================================================================
    // Private Non-Static Helper Methods
    // ============================================================================

    private async Task<Lead> GetLeadForBusinessOrThrowAsync(Guid leadId, Guid businessId, CancellationToken cancellationToken)
    {
        var lead = await _leadRepository.GetByIdForBusinessAsync(businessId, leadId, cancellationToken);
        if (lead == null)
        {
            throw new InvalidOperationException($"Lead with ID {leadId} not found for business {businessId}.");
        }

        return lead;
    }

    private Task UpdateLeadScoreAsync(
        Lead lead,
        int finalScore,
        LeadStatus recommendedStatus,
        ScoringConfiguration config,
        CancellationToken cancellationToken,
        RulesScoreComponent? rulesScore = null)
    {
        lead.Score = finalScore;
        if (config.AutoTransitionStatus && lead.Status != recommendedStatus)
        {
            lead.Status = recommendedStatus;
        }

        // Update BANT scores if available
        if (rulesScore != null)
        {
            lead.BudgetScore = rulesScore.BudgetScore;
            lead.AuthorityScore = rulesScore.AuthorityScore;
            lead.NeedScore = rulesScore.NeedScore;
            lead.TimelineScore = rulesScore.TimelineScore;
        }

        // Use business-aware update for background job compatibility
        return _leadRepository.UpdateForBusinessAsync(lead.BusinessId, lead, cancellationToken);
    }

    private async Task SaveScoreHistoryAsync(
        Guid leadId,
        int score,
        int previousScore,
        List<ScoringFactor> factors,
        CancellationToken cancellationToken)
    {
        var factorsBreakdown = JsonSerializer.Serialize(factors, JsonOptions);

        var historyEntry = new ScoreHistory
        {
            Id = Guid.NewGuid(),
            LeadId = leadId,
            Score = score,
            PreviousScore = previousScore,
            ScoreChange = score - previousScore,
            Source = "LeadScoringService",
            Reason = factors.Count > 0 ? $"Scored based on {factors.Count} factors" : "Initial scoring",
            ScoreBreakdown = factorsBreakdown,
            ScoredAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        await _scoreHistoryRepository.CreateAsync(historyEntry, cancellationToken);
        LogScoreHistorySaved(leadId, score, previousScore);
    }

    private async Task<AIScoreComponent> CalculateAIScoreAsync(
        CalculateScoreRequest request,
        ScoringConfiguration config,
        CancellationToken cancellationToken)
    {
        try
        {
            var aiRequest = new QualifyLeadRequest
            {
                LeadId = request.LeadId,
                BusinessId = request.BusinessId,
                ConversationId = request.ConversationId,
                ForceRequalify = false,
            };

            var aiResult = await _aiService.QualifyLeadAsync(aiRequest, cancellationToken);

            // Calculate component scores from AI factors
            var weights = config.AIFactorWeights;
            var intentScore = aiResult.Score; // Use overall as proxy for intent
            var sentimentScore = (int)(aiResult.Confidence * 100); // Use confidence as proxy
            var engagementScore = Math.Min(100, aiResult.CriterionScores.Count * 25);

            var overallScore = (intentScore * weights.Intent / 100) +
                              (sentimentScore * weights.Sentiment / 100) +
                              (engagementScore * weights.Engagement / 100);

            return new AIScoreComponent
            {
                Score = NormalizeScore(overallScore),
                Confidence = aiResult.Confidence,
                Reasoning = aiResult.Reasoning,
                IntentScore = intentScore,
                SentimentScore = sentimentScore,
                EngagementScore = engagementScore,
            };
        }
        catch (Exception ex)
        {
            LogAIScoreError(request.LeadId, ex.Message);

            // Return default low score on AI failure
            return new AIScoreComponent
            {
                Score = 50,
                Confidence = 0.5f,
                Reasoning = "AI scoring unavailable, using default score",
            };
        }
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "LeadScoringService initialized")]
    private partial void LogServiceInitialized();

    [LoggerMessage(Level = LogLevel.Information, Message = "Calculating score for lead {LeadId} in business {BusinessId}")]
    private partial void LogCalculatingScore(Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Score calculated for lead {LeadId}: {Score} (previous: {PreviousScore})")]
    private partial void LogScoreCalculated(Guid leadId, int score, int previousScore);

    [LoggerMessage(Level = LogLevel.Information, Message = "Recalculating score for lead {LeadId}, trigger: {Trigger}")]
    private partial void LogRecalculatingScore(Guid leadId, string trigger);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting score history for lead {LeadId}, limit: {Limit}")]
    private partial void LogGettingScoreHistory(Guid leadId, int limit);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating scoring configuration for business {BusinessId}")]
    private partial void LogUpdatingConfiguration(Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI score calculation failed for lead {LeadId}: {Error}")]
    private partial void LogAIScoreError(Guid leadId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Score history saved for lead {LeadId}: {Score} (previous: {PreviousScore})")]
    private partial void LogScoreHistorySaved(Guid leadId, int score, int previousScore);
}

