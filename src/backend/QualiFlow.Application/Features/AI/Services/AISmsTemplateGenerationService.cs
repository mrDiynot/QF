// -----------------------------------------------------------------------
// <copyright file="AISmsTemplateGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for generating SMS templates using AI.
/// Uses OpenAI to generate multiple template variations based on purpose and context.
/// </summary>
/// <param name="openAIService">OpenAI service for AI completions.</param>
/// <param name="modelSelector">AI model selector for task-appropriate models.</param>
/// <param name="auditService">Service for logging AI generations.</param>
/// <param name="usageLimitService">Service for checking usage limits.</param>
/// <param name="usageTrackingService">Service for tracking external usage.</param>
/// <param name="logger">Logger instance.</param>
public sealed partial class AISmsTemplateGenerationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    ILogger<AISmsTemplateGenerationService> logger) : IAISmsTemplateGenerationService
{
    private const string SystemPrompt = """
        You are an expert SMS marketing copywriter. Generate concise, engaging SMS templates.

        CRITICAL RULES:
        1. Keep messages under 160 characters when possible (1 SMS segment)
        2. Use clear, action-oriented language
        3. Include a clear call-to-action
        4. Be professional but personable
        5. Avoid spam trigger words
        6. Use variable placeholders in format {{variable_name}} when requested

        Common variables: {{name}}, {{first_name}}, {{company}}, {{date}}, {{time}}, {{link}}, {{amount}}

        Return ONLY valid JSON in the specified format, no additional text.
        """;

    /// <inheritdoc />
    public async Task<SmsTemplateGenerationResult> GenerateSmsTemplatesAsync(
        GenerateSmsTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogGenerationStarted(request.BusinessId, request.Purpose, request.VariationCount);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Step 1: Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(request.BusinessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(request.BusinessId);
                return SmsTemplateGenerationResult.Failed("AI interaction limit exceeded for this billing period.", limitExceeded: true);
            }

            // Step 2: Build prompt
            var userPrompt = BuildUserPrompt(request);

            // Step 3: Get model selection
            var modelSelection = modelSelector.SelectModel(AITaskType.SmsTemplateGeneration, request.BusinessId);

            // Step 4: Generate templates using AI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPrompt,
                maxTokens: 1500,
                temperature: 0.7f,
                cancellationToken);

            stopwatch.Stop();

            // Step 5: Parse response
            var templates = ParseTemplatesResponse(aiResponse, request.Category);
            if (templates == null || templates.Count == 0)
            {
                LogParsingFailed(request.BusinessId);
                return SmsTemplateGenerationResult.Failed("Failed to parse AI-generated templates. Please try again.");
            }

            // Step 6: Estimate token usage
            var inputTokens = (SystemPrompt.Length + userPrompt.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var estimatedCost = CalculateCost(inputTokens, outputTokens, modelSelection.Model);

            // Step 7: Log to audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = request.UserId,
                    TaskType = AITaskType.SmsTemplateGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    EstimatedCostUsd = estimatedCost,
                    IsSuccess = true,
                    Metadata = JsonSerializer.Serialize(new { request.Purpose, request.Category }),
                },
                cancellationToken);

            // Step 8: Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                request.BusinessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "sms_template_generation",
                null,
                null,
                (int)stopwatch.ElapsedMilliseconds,
                cancellationToken);

            // Step 9: Increment usage counters
            await usageLimitService.IncrementAiInteractionsAsync(request.BusinessId, cancellationToken);

            LogGenerationCompleted(request.BusinessId, templates.Count, stopwatch.ElapsedMilliseconds);

            return SmsTemplateGenerationResult.Succeeded(
                templates,
                auditResult.AuditId,
                inputTokens + outputTokens,
                estimatedCost,
                stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogGenerationError(request.BusinessId, ex.Message);
            return SmsTemplateGenerationResult.Failed($"An error occurred during template generation: {ex.Message}");
        }
    }

    private static string BuildUserPrompt(GenerateSmsTemplateRequest request)
    {
        var sb = new System.Text.StringBuilder();
        sb.Append(CultureInfo.InvariantCulture, $"Generate {request.VariationCount} SMS template variations for the following purpose:");
        sb.AppendLine();
        sb.AppendLine();
        sb.Append(CultureInfo.InvariantCulture, $"PURPOSE: {request.Purpose}");
        sb.AppendLine();
        sb.Append(CultureInfo.InvariantCulture, $"CATEGORY: {request.Category}");
        sb.AppendLine();
        sb.Append(CultureInfo.InvariantCulture, $"TONE: {request.Tone}");
        sb.AppendLine();

        if (!string.IsNullOrEmpty(request.Industry))
        {
            sb.Append(CultureInfo.InvariantCulture, $"INDUSTRY: {request.Industry}");
            sb.AppendLine();
        }

        if (!string.IsNullOrEmpty(request.BusinessContext))
        {
            sb.Append(CultureInfo.InvariantCulture, $"BUSINESS CONTEXT: {request.BusinessContext}");
            sb.AppendLine();
        }

        if (request.IncludeVariables)
        {
            sb.AppendLine("INCLUDE VARIABLES: Yes, use {{variable_name}} format for personalization");
        }

        if (request.ExampleTemplates?.Count > 0)
        {
            sb.AppendLine();
            sb.AppendLine("EXAMPLE TEMPLATES FOR REFERENCE:");
            foreach (var example in request.ExampleTemplates)
            {
                sb.Append(CultureInfo.InvariantCulture, $"- {example}");
                sb.AppendLine();
            }
        }

        sb.AppendLine();
        sb.AppendLine("Return a JSON object with this structure:");
        sb.AppendLine("{");
        sb.AppendLine("    \"templates\": [");
        sb.AppendLine("        {");
        sb.AppendLine("            \"name\": \"Template Name\",");
        sb.AppendLine("            \"content\": \"The SMS message content\"");
        sb.AppendLine("        }");
        sb.AppendLine("    ]");
        sb.AppendLine("}");

        return sb.ToString();
    }

    private static List<GeneratedSmsTemplate>? ParseTemplatesResponse(string aiResponse, string category)
    {
        try
        {
            // Extract JSON from response (handle markdown code blocks)
            var jsonContent = aiResponse.Trim();
            if (jsonContent.StartsWith("```", StringComparison.Ordinal))
            {
                var startIndex = jsonContent.IndexOf('{', StringComparison.Ordinal);
                var endIndex = jsonContent.LastIndexOf('}');
                if (startIndex >= 0 && endIndex > startIndex)
                {
                    jsonContent = jsonContent[startIndex..(endIndex + 1)];
                }
            }

            using var doc = JsonDocument.Parse(jsonContent);
            var root = doc.RootElement;

            if (!root.TryGetProperty("templates", out var templatesArray))
            {
                return null;
            }

            var templates = new List<GeneratedSmsTemplate>();
            foreach (var templateElement in templatesArray.EnumerateArray())
            {
                var name = templateElement.GetProperty("name").GetString() ?? "Untitled Template";
                var content = templateElement.GetProperty("content").GetString() ?? string.Empty;

                // Extract variables from content
                var variables = ExtractVariables(content);

                templates.Add(new GeneratedSmsTemplate
                {
                    Name = name,
                    Content = content,
                    Category = category,
                    CharacterCount = content.Length,
                    SegmentCount = CalculateSegmentCount(content),
                    Variables = variables,
                });
            }

            return templates;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static List<string> ExtractVariables(string content)
    {
        var variables = new List<string>();
        var matches = VariablePattern().Matches(content);
        foreach (Match match in matches)
        {
            var variable = match.Groups["var"].Value;
            if (!variables.Contains(variable, StringComparer.OrdinalIgnoreCase))
            {
                variables.Add(variable);
            }
        }

        return variables;
    }

    private static int CalculateSegmentCount(string content)
    {
        // Standard SMS is 160 chars, but with Unicode it's 70 chars
        // For simplicity, assume GSM-7 encoding (160 chars per segment)
        const int charsPerSegment = 160;
        return (content.Length + charsPerSegment - 1) / charsPerSegment;
    }

    private static decimal CalculateCost(int inputTokens, int outputTokens, string model)
    {
        // GPT-5-mini pricing (estimated)
        var inputCostPer1K = model.Contains("nano", StringComparison.OrdinalIgnoreCase) ? 0.0001m : 0.003m;
        var outputCostPer1K = model.Contains("nano", StringComparison.OrdinalIgnoreCase) ? 0.0002m : 0.006m;

        return (inputTokens / 1000m * inputCostPer1K) + (outputTokens / 1000m * outputCostPer1K);
    }

    [GeneratedRegex(@"\{\{(?<var>\w+)\}\}", RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex VariablePattern();

    #region Logging

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting SMS template generation for business {BusinessId}. Purpose: {Purpose}, Variations: {VariationCount}")]
    private partial void LogGenerationStarted(Guid businessId, string purpose, int variationCount);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI usage limit exceeded for business {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse AI response for business {BusinessId}")]
    private partial void LogParsingFailed(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "SMS template generation completed for business {BusinessId}. Generated {TemplateCount} templates in {DurationMs}ms")]
    private partial void LogGenerationCompleted(Guid businessId, int templateCount, long durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "SMS template generation failed for business {BusinessId}: {ErrorMessage}")]
    private partial void LogGenerationError(Guid businessId, string errorMessage);

    #endregion
}

