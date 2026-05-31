// -----------------------------------------------------------------------
// <copyright file="AIFormGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service implementation for AI-powered form generation.
/// Uses GPT-5.2 to generate optimized lead capture forms with BANT-mapped fields.
/// </summary>
public sealed partial class AIFormGenerationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    ILogger<AIFormGenerationService> logger) : IAIFormGenerationService
{
    private const string FormGenerationSystemPrompt = """
        You are an expert form designer for lead capture. Your role is to generate optimized forms
        that maximize conversion while collecting valuable lead qualification data.

        Requirements:
        1. Generate 5-10 fields appropriate for the industry and purpose
        2. Include at least 2 BANT-mapped fields (Budget, Authority, Need, Timeline)
        3. Use appropriate field types: text, email, phone, select, radio, checkbox, textarea
        4. Include validation rules where appropriate
        5. Order fields for optimal conversion (easy fields first, qualifying fields later)
        6. Make field labels clear and professional
        7. Provide helpful placeholder text

        Return ONLY valid JSON in the specified format, no additional text.
        """;

    /// <inheritdoc />
    public async Task<FormGenerationResult> GenerateFormAsync(
        GenerateFormRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogFormGenerationStarted(logger, request.BusinessId, request.Industry, request.Purpose);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Step 1: Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(request.BusinessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(logger, request.BusinessId);
                return FormGenerationResult.Failed("AI interaction limit exceeded for this billing period.", limitExceeded: true);
            }

            // Step 2: Build prompt
            var userPrompt = BuildUserPrompt(request);

            // Step 3: Get model selection
            var modelSelection = modelSelector.SelectModel(AITaskType.FormGeneration, request.BusinessId);

            // Step 4: Generate form using AI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                FormGenerationSystemPrompt,
                maxTokens: 2000,
                temperature: 0.5f,
                cancellationToken);

            stopwatch.Stop();

            // Step 5: Parse response
            var generatedForm = ParseFormResponse(aiResponse);
            if (generatedForm == null)
            {
                LogParsingFailed(logger, request.BusinessId);
                return FormGenerationResult.Failed("Failed to parse AI-generated form. Please try again.");
            }

            // Step 6: Estimate token usage
            var inputTokens = (FormGenerationSystemPrompt.Length + userPrompt.Length) / 4;
            var outputTokens = aiResponse.Length / 4;
            var estimatedCost = CalculateCost(inputTokens, outputTokens, modelSelection.Model);

            // Step 7: Log to audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = request.UserId,
                    TaskType = AITaskType.FormGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    EstimatedCostUsd = estimatedCost,
                    IsSuccess = true,
                    Metadata = JsonSerializer.Serialize(new { request.Industry, request.Purpose }),
                },
                cancellationToken);

            // Step 8: Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                request.BusinessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "form_generation",
                null,
                null,
                (int)stopwatch.ElapsedMilliseconds,
                cancellationToken);

            // Step 9: Increment usage counters
            await usageLimitService.IncrementAiInteractionsAsync(request.BusinessId, cancellationToken);

            LogFormGenerationCompleted(logger, request.BusinessId, generatedForm.Fields.Count, stopwatch.ElapsedMilliseconds);

            return FormGenerationResult.Succeeded(
                generatedForm,
                auditResult.AuditId,
                inputTokens + outputTokens,
                estimatedCost,
                stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            LogFormGenerationFailed(logger, request.BusinessId, ex.Message);

            // Log failed attempt to audit
            await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = request.BusinessId,
                    UserId = request.UserId,
                    TaskType = AITaskType.FormGeneration,
                    InputPrompt = BuildUserPrompt(request),
                    OutputJson = string.Empty,
                    InputTokens = 0,
                    OutputTokens = 0,
                    ModelUsed = modelSelector.SelectModel(AITaskType.FormGeneration, request.BusinessId).Model,
                    DurationMs = (int)stopwatch.ElapsedMilliseconds,
                    EstimatedCostUsd = 0,
                    IsSuccess = false,
                    ErrorMessage = ex.Message,
                },
                cancellationToken);

            return FormGenerationResult.Failed($"Form generation failed: {ex.Message}");
        }
    }

    // ========================================
    // Prompt Building Methods
    // ========================================

    private static string BuildUserPrompt(GenerateFormRequest request)
    {
        var desiredFieldsText = request.DesiredFields != null && request.DesiredFields.Count > 0
            ? string.Join(", ", request.DesiredFields)
            : "Standard lead capture fields";

        var bantText = request.IncludeBantFields
            ? "Include BANT qualification fields (Budget, Authority, Need, Timeline)."
            : "Focus on contact information only.";

        var toneText = !string.IsNullOrEmpty(request.Tone)
            ? $"Use a {request.Tone} tone in labels and placeholders."
            : string.Empty;

        return $$"""
            Generate a lead capture form for:

            Industry: {{request.Industry}}
            Purpose: {{request.Purpose}}
            Desired Fields: {{desiredFieldsText}}
            Maximum Fields: {{request.MaxFields}}
            {{bantText}}
            {{toneText}}

            Return JSON in this exact format:
            {
              "name": "Form Name based on purpose",
              "description": "Brief description",
              "fields": [
                {
                  "id": "field_1",
                  "label": "Field Label",
                  "type": "text|email|phone|select|radio|checkbox|textarea",
                  "required": true,
                  "placeholder": "Placeholder text",
                  "bantCategory": "Budget|Authority|Need|Timeline|null",
                  "options": ["option1", "option2"],
                  "validation": { "pattern": "regex", "message": "error message" },
                  "order": 1
                }
              ],
              "submitButtonText": "Get Started",
              "successMessage": "Thank you for your interest!"
            }
            """;
    }

    // ========================================
    // Response Parsing Methods
    // ========================================

    private static GeneratedFormData? ParseFormResponse(string aiResponse)
    {
        try
        {
            // Clean up potential markdown code blocks
            var json = aiResponse.Trim();
            if (json.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                json = json[7..];
            }
            else if (json.StartsWith("```", StringComparison.Ordinal))
            {
                json = json[3..];
            }

            if (json.EndsWith("```", StringComparison.Ordinal))
            {
                json = json[..^3];
            }

            json = json.Trim();

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var fields = new List<GeneratedFormField>();
            if (root.TryGetProperty("fields", out var fieldsElement))
            {
                var order = 0;
                foreach (var field in fieldsElement.EnumerateArray())
                {
                    fields.Add(ParseField(field, order++));
                }
            }

            return new GeneratedFormData
            {
                Name = root.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "Generated Form" : "Generated Form",
                Description = root.TryGetProperty("description", out var descEl) ? descEl.GetString() : null,
                Fields = fields,
                SubmitButtonText = root.TryGetProperty("submitButtonText", out var btnEl) ? btnEl.GetString() ?? "Submit" : "Submit",
                SuccessMessage = root.TryGetProperty("successMessage", out var msgEl) ? msgEl.GetString() : null,
            };
        }
        catch
        {
            return null;
        }
    }

    private static GeneratedFormField ParseField(JsonElement field, int defaultOrder)
    {
        List<string>? options = null;
        if (field.TryGetProperty("options", out var optionsEl) && optionsEl.ValueKind == JsonValueKind.Array)
        {
            options = optionsEl.EnumerateArray()
                .Select(o => o.GetString() ?? string.Empty)
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
        }

        FieldValidation? validation = null;
        if (field.TryGetProperty("validation", out var validationEl) && validationEl.ValueKind == JsonValueKind.Object)
        {
            validation = new FieldValidation
            {
                Pattern = validationEl.TryGetProperty("pattern", out var patternEl) ? patternEl.GetString() : null,
                Message = validationEl.TryGetProperty("message", out var messageEl) ? messageEl.GetString() : null,
            };
        }

        return new GeneratedFormField
        {
            Id = field.TryGetProperty("id", out var idEl) ? idEl.GetString() ?? $"field_{defaultOrder}" : $"field_{defaultOrder}",
            Label = field.TryGetProperty("label", out var labelEl) ? labelEl.GetString() ?? "Field" : "Field",
            Type = field.TryGetProperty("type", out var typeEl) ? typeEl.GetString() ?? "text" : "text",
            Required = field.TryGetProperty("required", out var reqEl) && reqEl.GetBoolean(),
            Placeholder = field.TryGetProperty("placeholder", out var phEl) ? phEl.GetString() : null,
            BantCategory = field.TryGetProperty("bantCategory", out var bantEl) ? bantEl.GetString() : null,
            Options = options,
            Validation = validation,
            Order = field.TryGetProperty("order", out var orderEl) ? orderEl.GetInt32() : defaultOrder,
        };
    }

    // ========================================
    // Cost Calculation
    // ========================================

    private static decimal CalculateCost(int inputTokens, int outputTokens, string model)
    {
        // GPT-5.2 pricing (estimated based on OpenAI pricing patterns)
        // Input: $0.01 per 1K tokens, Output: $0.03 per 1K tokens
        var inputCost = inputTokens * 0.00001m;
        var outputCost = outputTokens * 0.00003m;

        // Adjust for model tier
        var multiplier = model switch
        {
            "gpt-5.2" => 1.0m,
            "gpt-5-mini" => 0.5m,
            "gpt-5-nano" => 0.25m,
            _ => 1.0m,
        };

        return (inputCost + outputCost) * multiplier;
    }

    // ========================================
    // Source-generated logging methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting form generation for business {BusinessId}: Industry={Industry}, Purpose={Purpose}")]
    private static partial void LogFormGenerationStarted(ILogger logger, Guid businessId, string industry, string purpose);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Usage limit exceeded for business {BusinessId}")]
    private static partial void LogUsageLimitExceeded(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to parse AI response for business {BusinessId}")]
    private static partial void LogParsingFailed(ILogger logger, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Form generation completed for business {BusinessId}: {FieldCount} fields in {DurationMs}ms")]
    private static partial void LogFormGenerationCompleted(ILogger logger, Guid businessId, int fieldCount, long durationMs);

    [LoggerMessage(Level = LogLevel.Error, Message = "Form generation failed for business {BusinessId}: {ErrorMessage}")]
    private static partial void LogFormGenerationFailed(ILogger logger, Guid businessId, string errorMessage);
}

