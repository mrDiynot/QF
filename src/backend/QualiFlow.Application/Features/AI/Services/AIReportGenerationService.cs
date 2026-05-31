// -----------------------------------------------------------------------
// <copyright file="AIReportGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Interfaces;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service implementation for AI-powered report generation.
/// Uses GPT-5.2 to generate comprehensive business reports with insights.
/// </summary>
public sealed partial class AIReportGenerationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    ILeadRepository leadRepository,
    IConversationRepository conversationRepository,
    ILogger<AIReportGenerationService> logger) : IAIReportGenerationService
{
    private const string SystemPrompt = """
        You are an expert business analyst generating comprehensive reports.
        Analyze the provided business data and generate insightful reports with:
        1. Executive summary highlighting key findings
        2. Key insights with trends and patterns
        3. Detailed metrics organized by section
        4. Chart data for visualization
        5. Actionable recommendations based on the data

        Return JSON in this exact format:
        {
          "title": "Report Title",
          "executiveSummary": "Brief summary of key findings...",
          "keyInsights": [
            { "title": "Insight Title", "description": "Details...", "icon": "📈", "trend": "up|down|stable" }
          ],
          "sections": [
            {
              "title": "Section Title",
              "description": "Section overview",
              "metrics": [
                { "name": "Metric Name", "value": "100", "change": "+10%", "changeType": "positive|negative|neutral" }
              ]
            }
          ],
          "charts": [
            { "title": "Chart Title", "type": "line|bar|pie", "data": [{ "label": "Label", "value": 100 }] }
          ],
          "recommendations": [
            { "title": "Recommendation", "description": "Details...", "priority": "high|medium|low", "category": "conversion|engagement|efficiency" }
          ]
        }
        """;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    /// <inheritdoc />
    public async Task<ReportGenerationResult> GenerateReportAsync(
        ReportGenerationRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        LogReportGenerationStarted(request.BusinessId, request.ReportType.ToString());

        try
        {
            // Step 1: Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(request.BusinessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(request.BusinessId);
                return ReportGenerationResult.Failed("AI interaction limit exceeded for this billing period.", limitExceeded: true);
            }

            // Step 2: Gather business data
            var businessData = await GatherBusinessDataAsync(request, cancellationToken);

            // Step 3: Build prompt
            var userPrompt = BuildUserPrompt(request, businessData);

            // Step 4: Get model selection (gpt-4o for comprehensive analysis)
            var modelSelection = modelSelector.SelectModel(AITaskType.ReportGeneration, request.BusinessId);

            // Step 5: Generate report using AI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPrompt,
                maxTokens: 4000,
                temperature: 0.5f,
                cancellationToken);

            stopwatch.Stop();
            var durationMs = (int)stopwatch.ElapsedMilliseconds;

            // Step 6: Parse response
            var result = ParseReportResponse(aiResponse, request);
            if (!result.Success)
            {
                LogReportGenerationFailed(request.BusinessId, "Failed to parse AI response");
                return result;
            }

            // Step 7: Estimate tokens and cost
            var inputTokens = (SystemPrompt.Length + userPrompt.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var totalTokens = inputTokens + outputTokens;
            var estimatedCost = ((inputTokens * modelSelection.EstimatedInputCostPer1K) +
                                 (outputTokens * modelSelection.EstimatedOutputCostPer1K)) / 1000m;

            // Step 8: Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                request.BusinessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "report_generation",
                durationMs: durationMs,
                cancellationToken: cancellationToken);

            // Step 9: Log audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = request.UserId,
                    TaskType = AITaskType.ReportGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = durationMs,
                    EstimatedCostUsd = estimatedCost,
                },
                cancellationToken);

            // Step 10: Increment usage counters
            await usageLimitService.IncrementAiInteractionsAsync(request.BusinessId, cancellationToken);

            LogReportGenerationCompleted(request.BusinessId, request.ReportType.ToString(), durationMs);

            return result with { AuditId = auditResult.AuditId, TokensUsed = totalTokens };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogReportGenerationError(request.BusinessId, ex.Message);
            return ReportGenerationResult.Failed($"Report generation failed: {ex.Message}");
        }
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    private async Task<BusinessDataSummary> GatherBusinessDataAsync(
        ReportGenerationRequest request,
        CancellationToken cancellationToken)
    {
        // Use GetAllAsync which is scoped to the current user's business via global query filters
        // Get up to 1000 leads for report generation (paginated)
        var leads = await leadRepository.GetAllAsync(
            status: null,
            skip: 0,
            take: 1000,
            cancellationToken);

        // Get conversations for the business
        var conversations = await conversationRepository.GetAllAsync(
            businessId: request.BusinessId,
            leadId: null,
            status: null,
            channel: null,
            skip: 0,
            take: 1000,
            cancellationToken);

        // Filter by date range
        var filteredLeads = leads
            .Where(l => l.CreatedAt >= request.DateFrom && l.CreatedAt <= request.DateTo)
            .ToList();

        var filteredConversations = conversations
            .Where(c => c.CreatedAt >= request.DateFrom && c.CreatedAt <= request.DateTo)
            .ToList();

        return new BusinessDataSummary
        {
            TotalLeads = filteredLeads.Count,
            QualifiedLeads = filteredLeads.Count(l => l.Score >= 70),
            UnqualifiedLeads = filteredLeads.Count(l => l.Score < 70 && l.Score > 0),
            NewLeads = filteredLeads.Count(l => l.Score == 0),
            TotalConversations = filteredConversations.Count,
            AverageScore = filteredLeads.Count > 0 ? filteredLeads.Average(l => l.Score) : 0,
            LeadsByChannel = filteredLeads.GroupBy(l => l.SourceChannel ?? "Unknown")
                .ToDictionary(g => g.Key, g => g.Count()),
            LeadsByStatus = filteredLeads.GroupBy(l => l.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
        };
    }

    private static string BuildUserPrompt(ReportGenerationRequest request, BusinessDataSummary data)
    {
        var reportTypeDescription = request.ReportType switch
        {
            ReportType.LeadPerformance => "Lead performance and qualification metrics",
            ReportType.ConversionAnalysis => "Conversion funnel and stage progression",
            ReportType.ChannelEffectiveness => "Channel comparison and effectiveness",
            ReportType.RoiSummary => "ROI analysis with cost and revenue metrics",
            ReportType.AiUsageAnalysis => "AI feature usage and cost analysis",
            ReportType.TeamPerformance => "Team member performance metrics",
            ReportType.Custom => "Custom metrics analysis",
            _ => "General business performance",
        };

        var filtersText = request.Filters != null && request.Filters.Count > 0
            ? string.Join(", ", request.Filters.Select(kv => $"{kv.Key}: {kv.Value}"))
            : "None";

        var customMetricsText = request.CustomMetrics != null && request.CustomMetrics.Count > 0
            ? string.Join(", ", request.CustomMetrics)
            : "Standard metrics";

        return $$"""
            Generate a {{reportTypeDescription}} report for the following data:

            DATE RANGE: {{request.DateFrom:yyyy-MM-dd}} to {{request.DateTo:yyyy-MM-dd}}
            FILTERS: {{filtersText}}
            CUSTOM METRICS: {{customMetricsText}}
            INCLUDE TRENDS: {{request.IncludeTrends}}
            INCLUDE RECOMMENDATIONS: {{request.IncludeRecommendations}}

            BUSINESS DATA:
            - Total Leads: {{data.TotalLeads}}
            - Qualified Leads (Score >= 70): {{data.QualifiedLeads}}
            - Unqualified Leads: {{data.UnqualifiedLeads}}
            - New Leads (Unscored): {{data.NewLeads}}
            - Total Conversations: {{data.TotalConversations}}
            - Average Lead Score: {{data.AverageScore:F1}}
            - Leads by Channel: {{JsonSerializer.Serialize(data.LeadsByChannel)}}
            - Leads by Status: {{JsonSerializer.Serialize(data.LeadsByStatus)}}

            Generate a comprehensive report with insights and actionable recommendations.
            """;
    }

    private static ReportGenerationResult ParseReportResponse(string aiResponse, ReportGenerationRequest request)
    {
        try
        {
            // Extract JSON from response
            var jsonStart = aiResponse.IndexOf('{', StringComparison.Ordinal);
            var jsonEnd = aiResponse.LastIndexOf('}');

            if (jsonStart < 0 || jsonEnd < 0)
            {
                return ReportGenerationResult.Failed("Invalid AI response format.");
            }

            var jsonContent = aiResponse[jsonStart..(jsonEnd + 1)];
            var parsed = JsonSerializer.Deserialize<ParsedReport>(jsonContent, JsonOptions);

            if (parsed == null)
            {
                return ReportGenerationResult.Failed("Failed to parse report structure.");
            }

            var keyInsights = ParseKeyInsights(parsed.KeyInsights);
            var sections = ParseSections(parsed.Sections);
            var charts = ParseCharts(parsed.Charts);
            var recommendations = ParseRecommendations(parsed.Recommendations);

            return new ReportGenerationResult
            {
                Success = true,
                Title = parsed.Title ?? $"{request.ReportType} Report",
                ReportType = request.ReportType,
                DateRange = new ReportDateRange(request.DateFrom, request.DateTo),
                ExecutiveSummary = parsed.ExecutiveSummary ?? string.Empty,
                KeyInsights = keyInsights,
                Sections = sections,
                Charts = charts,
                Recommendations = recommendations,
            };
        }
        catch (JsonException)
        {
            return ReportGenerationResult.Failed("Failed to parse report structure.");
        }
    }

    private static List<ReportInsight> ParseKeyInsights(IEnumerable<ParsedInsight>? insights)
    {
        if (insights == null)
        {
            return [];
        }

        return insights
            .Select(i => new ReportInsight(i.Title ?? string.Empty, i.Description ?? string.Empty, i.Icon ?? "📊", i.Trend ?? "stable"))
            .ToList();
    }

    private static List<ReportSection> ParseSections(IEnumerable<ParsedSection>? sections)
    {
        if (sections == null)
        {
            return [];
        }

        return sections
            .Select(s => new ReportSection(s.Title ?? string.Empty, s.Description ?? string.Empty, ParseMetrics(s.Metrics)))
            .ToList();
    }

    private static List<ReportMetric> ParseMetrics(IEnumerable<ParsedMetric>? metrics)
    {
        if (metrics == null)
        {
            return [];
        }

        return metrics
            .Select(m => new ReportMetric(m.Name ?? string.Empty, m.Value ?? "0", m.Change, m.ChangeType))
            .ToList();
    }

    private static List<ChartData> ParseCharts(IEnumerable<ParsedChart>? charts)
    {
        if (charts == null)
        {
            return [];
        }

        return charts
            .Select(c => new ChartData(c.Title ?? string.Empty, c.Type ?? "bar", ParseDataPoints(c.Data)))
            .ToList();
    }

    private static List<ChartDataPoint> ParseDataPoints(IEnumerable<ParsedDataPoint>? dataPoints)
    {
        if (dataPoints == null)
        {
            return [];
        }

        return dataPoints.Select(d => new ChartDataPoint(d.Label ?? string.Empty, d.Value)).ToList();
    }

    private static List<ReportRecommendation> ParseRecommendations(IEnumerable<ParsedRecommendation>? recommendations)
    {
        if (recommendations == null)
        {
            return [];
        }

        return recommendations
            .Select(r => new ReportRecommendation(r.Title ?? string.Empty, r.Description ?? string.Empty, r.Priority ?? "medium", r.Category ?? "general"))
            .ToList();
    }

    // ========================================
    // Logging Methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting report generation for business {BusinessId}, type: {ReportType}")]
    private partial void LogReportGenerationStarted(Guid businessId, string reportType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for business {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Report generation failed for business {BusinessId}: {Error}")]
    private partial void LogReportGenerationFailed(Guid businessId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Report generation completed for business {BusinessId}, type: {ReportType}, duration: {DurationMs}ms")]
    private partial void LogReportGenerationCompleted(Guid businessId, string reportType, int durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "Report generation error for business {BusinessId}: {Error}")]
    private partial void LogReportGenerationError(Guid businessId, string error);
}

// ========================================
// Internal DTOs for JSON Parsing
// ========================================

internal sealed record BusinessDataSummary
{
    public int TotalLeads { get; init; }
    public int QualifiedLeads { get; init; }
    public int UnqualifiedLeads { get; init; }
    public int NewLeads { get; init; }
    public int TotalConversations { get; init; }
    public double AverageScore { get; init; }
    public Dictionary<string, int> LeadsByChannel { get; init; } = [];
    public Dictionary<string, int> LeadsByStatus { get; init; } = [];
}

#pragma warning disable CA1812 // Internal types are instantiated via JSON deserialization

internal sealed record ParsedReport
{
    public string? Title { get; init; }
    public string? ExecutiveSummary { get; init; }
    public List<ParsedInsight>? KeyInsights { get; init; }
    public List<ParsedSection>? Sections { get; init; }
    public List<ParsedChart>? Charts { get; init; }
    public List<ParsedRecommendation>? Recommendations { get; init; }
}

internal sealed record ParsedInsight(string? Title, string? Description, string? Icon, string? Trend);
internal sealed record ParsedSection(string? Title, string? Description, List<ParsedMetric>? Metrics);
internal sealed record ParsedMetric(string? Name, string? Value, string? Change, string? ChangeType);
internal sealed record ParsedChart(string? Title, string? Type, List<ParsedDataPoint>? Data);
internal sealed record ParsedDataPoint(string? Label, decimal Value);
internal sealed record ParsedRecommendation(string? Title, string? Description, string? Priority, string? Category);

#pragma warning restore CA1812

