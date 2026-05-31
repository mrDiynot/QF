// -----------------------------------------------------------------------
// <copyright file="AIInsightsService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Collections.Concurrent;
using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for generating AI-powered business insights.
/// Analyzes lead data, conversations, and conversion patterns.
/// </summary>
/// <param name="openAIService">OpenAI service for AI completions.</param>
/// <param name="modelSelector">AI model selector for task-appropriate models.</param>
/// <param name="auditService">Service for logging AI generations.</param>
/// <param name="usageLimitService">Service for checking usage limits.</param>
/// <param name="usageTrackingService">Service for tracking external usage.</param>
/// <param name="leadRepository">Lead repository for data access.</param>
/// <param name="conversationRepository">Conversation repository for data access.</param>
/// <param name="logger">Logger instance.</param>
public sealed partial class AIInsightsService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    ILeadRepository leadRepository,
    IConversationRepository conversationRepository,
    ILogger<AIInsightsService> logger) : IAIInsightsService
{
    private const string SystemPrompt = """
        You are a business analytics expert. Analyze the provided metrics and generate actionable insights.

        ANALYSIS FOCUS:
        1. Identify conversion trends and patterns
        2. Highlight top objections and blockers from conversations
        3. Compare channel performance
        4. Detect anomalies (unusual spikes or drops)
        5. Provide actionable recommendations

        RESPONSE FORMAT:
        Return ONLY valid JSON with insights array. Each insight must have:
        - category: ConversionTrends|TopObjections|ChannelPerformance|QualificationPatterns|ResponseMetrics|SentimentTrends|ActivityPatterns|TeamPerformance
        - title: Short, impactful title
        - description: 2-3 sentence explanation
        - severity: Info|Positive|Warning|Critical
        - metricValue: Primary metric (e.g., "85%", "12 leads")
        - metricChange: Percentage change from previous period (number)
        - recommendation: Actionable next step
        - actionLink: Suggested page link (e.g., "/leads", "/channels", "/analytics")

        Be concise and actionable. Focus on the most impactful insights.
        """;

    private static readonly ConcurrentDictionary<Guid, CachedInsights> InsightsCache = new();
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    /// <inheritdoc />
    public async Task<InsightsResult> GetDashboardInsightsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        // Check cache first
        if (InsightsCache.TryGetValue(businessId, out var cached) && cached.ExpiresAt > DateTime.UtcNow)
        {
            LogCacheHit(businessId);
            return cached.Result with { CacheExpiresAt = cached.ExpiresAt };
        }

        // Generate fresh insights
        LogCacheMiss(businessId);
        return await RefreshDashboardInsightsAsync(businessId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<InsightsResult> GenerateCustomInsightsAsync(
        Guid businessId,
        InsightsRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var dateFrom = request.DateFrom ?? DateTime.UtcNow.AddDays(-30);
        var dateTo = request.DateTo ?? DateTime.UtcNow;

        return await GenerateInsightsInternalAsync(
            businessId,
            dateFrom,
            dateTo,
            request.MaxInsights,
            request.IncludeTrends,
            request.IncludeRecommendations,
            cacheResult: false,
            cancellationToken);
    }

    /// <inheritdoc />
    public async Task<InsightsResult> RefreshDashboardInsightsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var result = await GenerateInsightsInternalAsync(
            businessId,
            dateFrom: DateTime.UtcNow.AddDays(-7),
            dateTo: DateTime.UtcNow,
            maxInsights: 5,
            includeTrends: true,
            includeRecommendations: true,
            cacheResult: true,
            cancellationToken);

        return result;
    }

    /// <inheritdoc />
    public void InvalidateCache(Guid businessId)
    {
        InsightsCache.TryRemove(businessId, out _);
        LogCacheInvalidated(businessId);
    }

    private async Task<InsightsResult> GenerateInsightsInternalAsync(
        Guid businessId,
        DateTime dateFrom,
        DateTime dateTo,
        int maxInsights,
        bool includeTrends,
        bool includeRecommendations,
        bool cacheResult,
        CancellationToken cancellationToken)
    {
        LogInsightsGenerationStarted(businessId, dateFrom, dateTo);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Step 1: Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(businessId);
                return new InsightsResult { Success = false, ErrorMessage = "AI interaction limit exceeded.", LimitExceeded = true };
            }

            // Step 2: Gather metrics data
            var metricsData = await GatherMetricsDataAsync(businessId, dateFrom, dateTo, cancellationToken);

            // Step 3: Build prompt with metrics
            var userPrompt = BuildUserPrompt(metricsData, maxInsights, includeTrends, includeRecommendations);

            // Step 4: Get model selection
            var modelSelection = modelSelector.SelectModel(AITaskType.InsightsGeneration, businessId);

            // Step 5: Generate insights using AI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPrompt,
                maxTokens: 2000,
                temperature: 0.6f,
                cancellationToken);

            stopwatch.Stop();

            // Step 6: Parse response
            var insights = ParseInsightsResponse(aiResponse);
            if (insights == null || insights.Count == 0)
            {
                LogParsingFailed(businessId);
                return new InsightsResult { Success = false, ErrorMessage = "Failed to parse AI-generated insights." };
            }

            // Step 7: Estimate token usage
            var inputTokens = (SystemPrompt.Length + userPrompt.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var estimatedCost = CalculateCost(inputTokens, outputTokens, modelSelection.Model);

            // Step 8: Log to audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = businessId,
                    UserId = null, // System-generated
                    TaskType = AITaskType.InsightsGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    EstimatedCostUsd = estimatedCost,
                    IsSuccess = true,
                    Metadata = JsonSerializer.Serialize(new { dateFrom, dateTo, maxInsights }),
                },
                cancellationToken);

            // Step 9: Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "insights_generation",
                null,
                null,
                (int)stopwatch.ElapsedMilliseconds,
                cancellationToken);

            // Step 10: Increment usage counters
            await usageLimitService.IncrementAiInteractionsAsync(businessId, cancellationToken);

            // Build result
            var result = new InsightsResult
            {
                Success = true,
                Insights = insights,
                Summary = metricsData.Summary,
                Trends = includeTrends ? metricsData.Trends : null,
                AuditId = auditResult.AuditId,
                TokensUsed = inputTokens + outputTokens,
                GeneratedAt = DateTime.UtcNow,
            };

            // Cache if requested
            if (cacheResult)
            {
                var expiresAt = DateTime.UtcNow.Add(CacheDuration);
                InsightsCache[businessId] = new CachedInsights(result, expiresAt);
                result = result with { CacheExpiresAt = expiresAt };
            }

            LogInsightsGenerationCompleted(businessId, insights.Count, stopwatch.ElapsedMilliseconds);
            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogInsightsGenerationError(businessId, ex.Message);
            return new InsightsResult { Success = false, ErrorMessage = $"An error occurred: {ex.Message}" };
        }
    }

    private async Task<MetricsData> GatherMetricsDataAsync(
        Guid businessId,
        DateTime dateFrom,
        DateTime dateTo,
        CancellationToken cancellationToken)
    {
        // Get lead statistics
        var allLeads = await leadRepository.GetAllAsync(status: null, skip: 0, take: 1000, cancellationToken);
        var periodLeads = allLeads.Where(l => l.CreatedAt >= dateFrom && l.CreatedAt <= dateTo).ToList();

        // Get conversation statistics
        var conversations = await conversationRepository.GetAllAsync(businessId, skip: 0, take: 1000, cancellationToken: cancellationToken);
        var periodConversations = conversations.Where(c => c.StartedAt >= dateFrom && c.StartedAt <= dateTo).ToList();

        // Calculate metrics
        var totalLeads = periodLeads.Count;
        var qualifiedLeads = periodLeads.Count(l => l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Contacted);
        var conversionRate = totalLeads > 0 ? (decimal)qualifiedLeads / totalLeads * 100 : 0;
        var avgScore = periodLeads.Count > 0 ? (decimal)periodLeads.Average(l => l.Score) : 0;

        // Channel breakdown
        var channelStats = periodLeads
            .GroupBy(l => l.SourceChannel ?? "Unknown")
            .Select(g => new { Channel = g.Key, Count = g.Count(), AvgScore = g.Average(l => l.Score) })
            .OrderByDescending(c => c.Count)
            .ToList();

        // Status breakdown
        var statusStats = periodLeads
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToList();

        // Previous period for trends
        var previousPeriodDays = (dateTo - dateFrom).TotalDays;
        var previousFrom = dateFrom.AddDays(-previousPeriodDays);
        var previousLeads = allLeads.Where(l => l.CreatedAt >= previousFrom && l.CreatedAt < dateFrom).ToList();
        var previousQualified = previousLeads.Count(l => l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Contacted);
        var previousConversionRate = previousLeads.Count > 0 ? (decimal)previousQualified / previousLeads.Count * 100 : 0;
        var previousAvgScore = previousLeads.Count > 0 ? (decimal)previousLeads.Average(l => l.Score) : 0;

        return new MetricsData
        {
            Summary = new InsightsSummaryMetrics
            {
                PeriodStart = dateFrom,
                PeriodEnd = dateTo,
                TotalLeads = totalLeads,
                TotalConversations = periodConversations.Count,
                ConversionRate = Math.Round(conversionRate, 1),
                AverageLeadScore = Math.Round(avgScore, 1),
                AverageResponseTimeMinutes = 0, // Would need message timestamps
                TopChannel = channelStats.FirstOrDefault()?.Channel,
            },
            Trends = new InsightsTrendData
            {
                LeadCountChange = previousLeads.Count > 0
                    ? Math.Round((decimal)(totalLeads - previousLeads.Count) / previousLeads.Count * 100, 1)
                    : 0,
                ConversionRateChange = Math.Round(conversionRate - previousConversionRate, 1),
                AverageScoreChange = Math.Round(avgScore - previousAvgScore, 1),
                ResponseTimeChange = 0,
                Anomalies = DetectAnomalies(totalLeads, previousLeads.Count, conversionRate, previousConversionRate),
            },
            ChannelBreakdown = string.Join(", ", channelStats.Take(5).Select(c => $"{c.Channel}: {c.Count} leads ({c.AvgScore:F0} avg score)")),
            StatusBreakdown = string.Join(", ", statusStats.Select(s => $"{s.Status}: {s.Count}")),
        };
    }

    private static List<AnomalyDetection> DetectAnomalies(int currentLeads, int previousLeads, decimal currentRate, decimal previousRate)
    {
        var anomalies = new List<AnomalyDetection>();

        // Lead count anomaly (>50% change)
        if (previousLeads > 0)
        {
            var leadChange = (decimal)(currentLeads - previousLeads) / previousLeads * 100;
            if (Math.Abs(leadChange) > 50)
            {
                anomalies.Add(new AnomalyDetection
                {
                    Metric = "Lead Volume",
                    Description = leadChange > 0 ? "Unusual spike in lead volume" : "Unusual drop in lead volume",
                    IsSpike = leadChange > 0,
                    DeviationPercent = Math.Round(Math.Abs(leadChange), 1),
                });
            }
        }

        // Conversion rate anomaly (>20% change)
        if (previousRate > 0)
        {
            var rateChange = currentRate - previousRate;
            if (Math.Abs(rateChange) > 20)
            {
                anomalies.Add(new AnomalyDetection
                {
                    Metric = "Conversion Rate",
                    Description = rateChange > 0 ? "Significant improvement in conversion rate" : "Significant drop in conversion rate",
                    IsSpike = rateChange > 0,
                    DeviationPercent = Math.Round(Math.Abs(rateChange), 1),
                });
            }
        }

        return anomalies;
    }

    private static string BuildUserPrompt(MetricsData data, int maxInsights, bool includeTrends, bool includeRecommendations)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine(CultureInfo.InvariantCulture, $"Analyze the following business metrics and generate {maxInsights} key insights:");
        sb.AppendLine();
        sb.AppendLine("=== CURRENT PERIOD METRICS ===");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Period: {data.Summary.PeriodStart:yyyy-MM-dd} to {data.Summary.PeriodEnd:yyyy-MM-dd}");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Total Leads: {data.Summary.TotalLeads}");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Total Conversations: {data.Summary.TotalConversations}");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Conversion Rate: {data.Summary.ConversionRate}%");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Average Lead Score: {data.Summary.AverageLeadScore}");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Top Channel: {data.Summary.TopChannel ?? "N/A"}");
        sb.AppendLine();
        sb.AppendLine("=== CHANNEL BREAKDOWN ===");
        sb.AppendLine(data.ChannelBreakdown);
        sb.AppendLine();
        sb.AppendLine("=== STATUS BREAKDOWN ===");
        sb.AppendLine(data.StatusBreakdown);

        if (includeTrends && data.Trends != null)
        {
            sb.AppendLine();
            sb.AppendLine("=== WEEK-OVER-WEEK TRENDS ===");
            sb.AppendLine(CultureInfo.InvariantCulture, $"Lead Count Change: {data.Trends.LeadCountChange:+0.0;-0.0;0}%");
            sb.AppendLine(CultureInfo.InvariantCulture, $"Conversion Rate Change: {data.Trends.ConversionRateChange:+0.0;-0.0;0}%");
            sb.AppendLine(CultureInfo.InvariantCulture, $"Average Score Change: {data.Trends.AverageScoreChange:+0.0;-0.0;0}");

            if (data.Trends.Anomalies.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("=== DETECTED ANOMALIES ===");
                foreach (var anomaly in data.Trends.Anomalies)
                {
                    sb.AppendLine(CultureInfo.InvariantCulture, $"- {anomaly.Metric}: {anomaly.Description} ({anomaly.DeviationPercent}% deviation)");
                }
            }
        }

        sb.AppendLine();
        sb.AppendLine("=== REQUIREMENTS ===");
        sb.AppendLine(CultureInfo.InvariantCulture, $"Generate exactly {maxInsights} insights.");
        if (includeRecommendations)
        {
            sb.AppendLine("Include actionable recommendations for each insight.");
        }

        sb.AppendLine("Focus on the most impactful findings.");
        sb.AppendLine("Return valid JSON array of insights.");

        return sb.ToString();
    }

    private List<InsightItem>? ParseInsightsResponse(string aiResponse)
    {
        try
        {
            // Try to extract JSON from the response
            var jsonStart = aiResponse.IndexOf('[', StringComparison.Ordinal);
            var jsonEnd = aiResponse.LastIndexOf(']');

            if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart)
            {
                // Try object format
                jsonStart = aiResponse.IndexOf('{', StringComparison.Ordinal);
                jsonEnd = aiResponse.LastIndexOf('}');
            }

            if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart)
            {
                return null;
            }

            var jsonContent = aiResponse.Substring(jsonStart, jsonEnd - jsonStart + 1);

            // Parse as array or object with insights property
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() },
            };

            if (jsonContent.StartsWith('['))
            {
                return JsonSerializer.Deserialize<List<InsightItem>>(jsonContent, options);
            }

            var wrapper = JsonSerializer.Deserialize<InsightsWrapperDto>(jsonContent, options);
            return wrapper?.Insights;
        }
        catch (JsonException ex)
        {
            LogJsonParseError(ex.Message);
            return null;
        }
    }

    private static decimal CalculateCost(int inputTokens, int outputTokens, string model)
    {
        // GPT-4o pricing estimates (per 1M tokens)
        var inputCostPer1M = model switch
        {
            "gpt-4o" => 2.50m,
            "gpt-4o-mini" => 0.15m,
            _ => 2.50m,
        };

        var outputCostPer1M = model switch
        {
            "gpt-4o" => 10.00m,
            "gpt-4o-mini" => 0.60m,
            _ => 10.00m,
        };

        return (inputTokens * inputCostPer1M / 1_000_000m) + (outputTokens * outputCostPer1M / 1_000_000m);
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Debug, Message = "Cache hit for business {BusinessId} insights")]
    private partial void LogCacheHit(Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Cache miss for business {BusinessId} insights")]
    private partial void LogCacheMiss(Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Cache invalidated for business {BusinessId}")]
    private partial void LogCacheInvalidated(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting insights generation for business {BusinessId} from {DateFrom} to {DateTo}")]
    private partial void LogInsightsGenerationStarted(Guid businessId, DateTime dateFrom, DateTime dateTo);

    [LoggerMessage(Level = LogLevel.Information, Message = "Insights generation completed for business {BusinessId}: {InsightCount} insights in {DurationMs}ms")]
    private partial void LogInsightsGenerationCompleted(Guid businessId, int insightCount, long durationMs);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for business {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse AI response for business {BusinessId}")]
    private partial void LogParsingFailed(Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Insights generation error for business {BusinessId}: {ErrorMessage}")]
    private partial void LogInsightsGenerationError(Guid businessId, string errorMessage);

    [LoggerMessage(Level = LogLevel.Warning, Message = "JSON parse error: {ErrorMessage}")]
    private partial void LogJsonParseError(string errorMessage);

    // Helper classes
    private sealed record CachedInsights(InsightsResult Result, DateTime ExpiresAt);

    private sealed record MetricsData
    {
        public InsightsSummaryMetrics Summary { get; init; } = new();
        public InsightsTrendData? Trends { get; init; }
        public string ChannelBreakdown { get; init; } = string.Empty;
        public string StatusBreakdown { get; init; } = string.Empty;
    }

    /// <summary>
    /// Wrapper DTO for parsing AI response with insights array.
    /// Used by JSON deserialization.
    /// </summary>
#pragma warning disable CA1812 // Class is instantiated by JSON deserializer
#pragma warning disable S1144, S3459 // Used by JSON deserializer
    private sealed class InsightsWrapperDto
    {
        /// <summary>Gets or sets the insights list from AI response.</summary>
        public List<InsightItem>? Insights { get; set; }
    }
#pragma warning restore S1144, S3459
#pragma warning restore CA1812
}

