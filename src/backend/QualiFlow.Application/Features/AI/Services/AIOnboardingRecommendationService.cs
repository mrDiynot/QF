// -----------------------------------------------------------------------
// <copyright file="AIOnboardingRecommendationService.cs" company="QualiFlow">
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
/// Service for generating AI-powered onboarding recommendations.
/// </summary>
public sealed partial class AIOnboardingRecommendationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IExternalUsageTrackingService usageTrackingService,
    IUsageLimitService usageLimitService,
    ILogger<AIOnboardingRecommendationService> logger) : IAIOnboardingRecommendationService
{
    private const string OnboardingSystemPrompt = """
        You are an expert business consultant specializing in lead qualification and customer engagement.
        Your task is to analyze a business profile and provide personalized recommendations for:
        1. Communication channels (prioritized by effectiveness for their industry)
        2. Workflow templates (automation sequences that will drive results)
        3. Form configurations (lead capture forms with BANT qualification fields)
        4. AI configuration (tone, qualification threshold, scoring weights)
        5. Automation priorities (quick wins and high-impact automations)

        Consider the business's industry, size, goals, lead type, and target audience.
        Provide specific, actionable recommendations with clear rationales.

        Respond in JSON format with this structure:
        {
          "recommendedChannels": [
            { "channelType": "sms|voice|whatsapp|webchat|email|instagram|facebook", "priority": 1-100, "rationale": "...", "isHighlyRecommended": true/false, "expectedImpact": "..." }
          ],
          "recommendedWorkflows": [
            { "name": "...", "description": "...", "triggerType": "lead_created|form_submitted|message_received|...", "category": "...", "priority": 1-100, "rationale": "..." }
          ],
          "recommendedForms": [
            { "name": "...", "purpose": "...", "recommendedFields": ["name", "email", "phone", ...], "bantFields": ["budget", "timeline", ...], "priority": 1-100, "rationale": "..." }
          ],
          "aiConfiguration": {
            "recommendedTone": "professional|friendly|casual|formal",
            "qualificationThreshold": 70,
            "scoringWeights": { "budget": 25, "authority": 25, "need": 25, "timeline": 25 },
            "greetingMessage": "...",
            "followUpPreference": "sms-first|email-first|call-first",
            "rationale": "..."
          },
          "recommendedAutomations": [
            { "name": "...", "description": "...", "category": "...", "priority": 1-100, "rationale": "...", "isQuickWin": true/false }
          ]
        }
        """;

    private static readonly JsonSerializerOptions ParseJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    /// <inheritdoc />
    public async Task<OnboardingRecommendationResult> GetRecommendationsAsync(
        OnboardingRecommendationRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(request.BusinessId, cancellationToken);
            if (!canUseAI)
            {
                LogLimitExceeded(request.BusinessId);
                return OnboardingRecommendationResult.Failed(
                    "AI interaction limit reached. Please upgrade your plan.");
            }

            // Build user prompt
            var userPrompt = BuildUserPrompt(request);

            // Get model for onboarding recommendations (using gpt-5-nano for fast recommendations)
            var modelSelection = modelSelector.SelectModel(AITaskType.OnboardingRecommendation, request.BusinessId);

            LogGeneratingRecommendations(request.BusinessId, request.Industry, modelSelection.Model);

            // Call OpenAI
            var response = await openAIService.GenerateCompletionAsync(
                userPrompt,
                OnboardingSystemPrompt,
                modelSelection.MaxTokens,
                modelSelection.Temperature,
                cancellationToken);

            stopwatch.Stop();

            // Parse response
            var recommendations = ParseRecommendations(response);

            // Track usage
            var inputTokens = userPrompt.Length / 4;
            var outputTokens = response.Length / 4;
            var tokensUsed = inputTokens + outputTokens;

            await usageTrackingService.TrackOpenAIUsageAsync(
                request.BusinessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "onboarding_recommendation",
                null,
                null,
                stopwatch.ElapsedMilliseconds,
                cancellationToken);

            // Audit the generation
            var auditResponse = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = null,
                    TaskType = AITaskType.OnboardingRecommendation,
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

            LogRecommendationsGenerated(request.BusinessId, stopwatch.ElapsedMilliseconds);

            return recommendations with
            {
                Success = true,
                AuditId = auditResponse.AuditId,
                TokensUsed = tokensUsed,
                GenerationTimeMs = (int)stopwatch.ElapsedMilliseconds,
            };
        }
        catch (Exception ex)
        {
            LogGenerationError(request.BusinessId, ex.Message);
            return OnboardingRecommendationResult.Failed($"Failed to generate recommendations: {ex.Message}");
        }
    }

    private static string BuildUserPrompt(OnboardingRecommendationRequest request)
    {
        var goals = request.Goals.Count > 0
            ? string.Join(", ", request.Goals)
            : "Not specified";

        var leadSources = request.LeadSources.Count > 0
            ? string.Join(", ", request.LeadSources)
            : "Not specified";

        return $"""
            Please analyze this business profile and provide personalized onboarding recommendations:

            **Business Profile:**
            - Industry: {request.Industry}
            - Company Size: {request.CompanySize ?? "Not specified"}
            - Lead Type: {request.LeadType ?? "Not specified"}
            - Main Objective: {request.MainObjective ?? "Not specified"}
            - Goals: {goals}
            - Current Lead Sources: {leadSources}
            - Target Audience: {request.TargetAudience ?? "Not specified"}

            Based on this profile, recommend:
            1. Top 3-5 communication channels (prioritized for their industry)
            2. 3-5 workflow templates that would drive the most value
            3. 2-3 lead capture forms with appropriate BANT fields
            4. Optimal AI configuration (tone, threshold, scoring weights)
            5. Top 5 automation priorities (mark quick wins)

            Provide specific rationales for each recommendation.
            """;
    }

    private static OnboardingRecommendationResult ParseRecommendations(string jsonResponse)
    {
        try
        {
            // Extract JSON from response (handle markdown code blocks)
            var json = jsonResponse;
            if (json.Contains("```json", StringComparison.Ordinal))
            {
                var start = json.IndexOf("```json", StringComparison.Ordinal) + 7;
                var end = json.IndexOf("```", start, StringComparison.Ordinal);
                json = json[start..end].Trim();
            }
            else if (json.Contains("```", StringComparison.Ordinal))
            {
                var start = json.IndexOf("```", StringComparison.Ordinal) + 3;
                var end = json.IndexOf("```", start, StringComparison.Ordinal);
                json = json[start..end].Trim();
            }

            var parsed = JsonSerializer.Deserialize<ParsedRecommendations>(json, ParseJsonOptions);
            if (parsed == null)
            {
                return GetDefaultRecommendations();
            }

            return new OnboardingRecommendationResult
            {
                Success = true,
                RecommendedChannels = parsed.RecommendedChannels,
                RecommendedWorkflows = parsed.RecommendedWorkflows,
                RecommendedForms = parsed.RecommendedForms,
                AIConfiguration = parsed.AiConfiguration,
                RecommendedAutomations = parsed.RecommendedAutomations,
            };
        }
        catch
        {
            return GetDefaultRecommendations();
        }
    }

    private static OnboardingRecommendationResult GetDefaultRecommendations()
    {
        return new OnboardingRecommendationResult
        {
            Success = true,
            RecommendedChannels =
            [
                new() { ChannelType = "webchat", Priority = 90, IsHighlyRecommended = true, Rationale = "Universal channel for website visitors" },
                new() { ChannelType = "sms", Priority = 85, IsHighlyRecommended = true, Rationale = "High open rates for quick responses" },
                new() { ChannelType = "email", Priority = 75, Rationale = "Essential for follow-ups and documentation" },
            ],
            RecommendedWorkflows =
            [
                new() { Name = "New Lead Welcome", TriggerType = "lead_created", Priority = 95, Category = "engagement", Rationale = "Immediate engagement increases conversion" },
                new() { Name = "Lead Qualification", TriggerType = "form_submitted", Priority = 90, Category = "qualification", Rationale = "Automated BANT scoring" },
            ],
            RecommendedForms =
            [
                new() { Name = "Contact Form", Purpose = "General inquiries", RecommendedFields = ["name", "email", "phone", "message"], BantFields = ["timeline"], Priority = 90 },
            ],
            AIConfiguration = new AIConfigRecommendation
            {
                RecommendedTone = "professional",
                QualificationThreshold = 70,
                ScoringWeights = new BantWeights { Budget = 25, Authority = 25, Need = 25, Timeline = 25 },
                GreetingMessage = "Hi! How can we help you today?",
                FollowUpPreference = "sms-first",
            },
            RecommendedAutomations =
            [
                new() { Name = "Auto-Response", Category = "engagement", Priority = 95, IsQuickWin = true, Rationale = "Immediate response to inquiries" },
                new() { Name = "Lead Scoring", Category = "qualification", Priority = 90, IsQuickWin = true, Rationale = "Automatic BANT scoring" },
            ],
        };
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Generating onboarding recommendations for business {BusinessId}, industry: {Industry}, model: {Model}")]
    private partial void LogGeneratingRecommendations(Guid businessId, string industry, string model);

    [LoggerMessage(Level = LogLevel.Information, Message = "Onboarding recommendations generated for business {BusinessId} in {DurationMs}ms")]
    private partial void LogRecommendationsGenerated(Guid businessId, long durationMs);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI interaction limit exceeded for business {BusinessId}")]
    private partial void LogLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Failed to generate onboarding recommendations for business {BusinessId}: {Error}")]
    private partial void LogGenerationError(Guid businessId, string error);

    /// <summary>
    /// Internal class for parsing JSON response from OpenAI.
    /// Instantiated via JsonSerializer.Deserialize.
    /// </summary>
#pragma warning disable CA1812, S3459, S1144 // Instantiated via JSON deserialization, properties set by deserializer
    private sealed class ParsedRecommendations
    {
        public List<ChannelRecommendation> RecommendedChannels { get; set; } = [];
        public List<WorkflowRecommendation> RecommendedWorkflows { get; set; } = [];
        public List<FormRecommendation> RecommendedForms { get; set; } = [];
        public AIConfigRecommendation? AiConfiguration { get; set; }
        public List<AutomationRecommendation> RecommendedAutomations { get; set; } = [];
    }
#pragma warning restore CA1812, S3459, S1144
}

