// -----------------------------------------------------------------------
// <copyright file="AIWorkflowGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for AI-powered workflow generation.
/// </summary>
/// <param name="openAIService">OpenAI service for AI completions.</param>
/// <param name="modelSelector">AI model selector for task-appropriate models.</param>
/// <param name="auditService">Service for logging AI generations.</param>
/// <param name="usageLimitService">Service for checking usage limits.</param>
/// <param name="usageTrackingService">Service for tracking external usage.</param>
/// <param name="logger">Logger instance.</param>
public sealed partial class AIWorkflowGenerationService(
    IOpenAIService openAIService,
    IAIModelSelector modelSelector,
    IAIGenerationAuditService auditService,
    IUsageLimitService usageLimitService,
    IExternalUsageTrackingService usageTrackingService,
    ILogger<AIWorkflowGenerationService> logger) : IAIWorkflowGenerationService
{
    private const string SystemPrompt = """
        You are a workflow automation expert. Generate complete, executable workflow definitions.
        
        AVAILABLE TRIGGER TYPES:
        - lead_created: When a new lead is created
        - lead_status_changed: When lead status changes
        - form_submitted: When a form is submitted
        - message_received: When a message is received
        - scheduled: At scheduled time (cron expression)
        - booking_created: When an appointment is booked
        - conversation_started: When a conversation begins
        
        AVAILABLE ACTION TYPES:
        - send_sms: Send SMS message (requires: to, message)
        - send_email: Send email (requires: to, subject, body)
        - send_whatsapp: Send WhatsApp message (requires: to, message)
        - update_lead_status: Update lead status (requires: status)
        - assign_agent: Assign to agent (requires: agentId or auto)
        - add_tag: Add tag to lead (requires: tag)
        - create_task: Create a task (requires: title, dueIn)
        - ai_qualify: Run AI qualification
        - ai_respond: Generate AI response
        - notify_team: Send team notification (requires: message)
        
        STEP TYPES:
        - trigger: The workflow entry point
        - action: Execute an action
        - delay: Wait for specified time (config: duration, unit: minutes/hours/days)
        - condition: Branch based on condition
        - end: Workflow termination
        
        RESPONSE FORMAT (JSON):
        {
          "name": "Workflow Name",
          "description": "Description of what this workflow does",
          "category": "lead_qualification|follow_up|engagement|sales|communication",
          "trigger": {
            "type": "trigger_type",
            "description": "Human-readable description",
            "conditions": { "optional": "conditions" }
          },
          "steps": [
            {
              "id": "step_1",
              "type": "action|delay|condition|end",
              "name": "Step Name",
              "description": "What this step does",
              "icon": "emoji icon",
              "config": { "action-specific": "configuration" },
              "nextStepId": "step_2",
              "branches": [{ "condition": "condition text", "nextStepId": "step_x" }]
            }
          ],
          "estimatedTimeMinutes": 60
        }
        
        Generate practical, production-ready workflows.
        """;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    /// <inheritdoc />
    public async Task<WorkflowGenerationResult> GenerateWorkflowAsync(
        Guid businessId,
        WorkflowGenerationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogWorkflowGenerationStarted(businessId, request.GoalDescription, request.TriggerType);
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // Check usage limits
            var canUseAI = await usageLimitService.CanUseAiInteractionAsync(businessId, cancellationToken);
            if (!canUseAI)
            {
                LogUsageLimitExceeded(businessId);
                return new WorkflowGenerationResult
                {
                    Success = false,
                    ErrorMessage = "AI limit exceeded.",
                    LimitExceeded = true,
                };
            }

            // Build prompt
            var userPrompt = BuildUserPrompt(request);

            // Get model selection (gpt-5.2 for complex workflow generation)
            var modelSelection = modelSelector.SelectModel(AITaskType.WorkflowGeneration, businessId);

            // Generate via OpenAI
            var aiResponse = await openAIService.GenerateCompletionAsync(
                userPrompt,
                SystemPrompt,
                maxTokens: 3000,
                temperature: 0.7f,
                cancellationToken);

            stopwatch.Stop();
            var durationMs = (int)stopwatch.ElapsedMilliseconds;

            // Parse response
            var result = ParseWorkflowResponse(aiResponse);
            if (!result.Success)
            {
                LogWorkflowGenerationFailed(businessId, "Failed to parse AI response");
                return result;
            }

            // Estimate tokens
            var inputTokens = userPrompt.Length / 4;
            var outputTokens = aiResponse.Length / 4;
            var totalTokens = inputTokens + outputTokens;

            // Calculate estimated cost
            var estimatedCost = ((inputTokens * modelSelection.EstimatedInputCostPer1K) +
                                 (outputTokens * modelSelection.EstimatedOutputCostPer1K)) / 1000m;

            // Track usage
            await usageTrackingService.TrackOpenAIUsageAsync(
                businessId,
                inputTokens,
                outputTokens,
                modelSelection.Model,
                "workflow_generation",
                durationMs: durationMs,
                cancellationToken: cancellationToken);

            // Log audit
            var auditResult = await auditService.LogAIGenerationAsync(
                new LogAIGenerationRequest
                {
                    BusinessId = businessId,
                    TaskType = AITaskType.WorkflowGeneration,
                    InputPrompt = userPrompt,
                    OutputJson = aiResponse,
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens,
                    ModelUsed = modelSelection.Model,
                    DurationMs = durationMs,
                    EstimatedCostUsd = estimatedCost,
                },
                cancellationToken);

            result = result with
            {
                AuditId = auditResult.AuditId,
                TokensUsed = totalTokens,
                GeneratedAt = DateTime.UtcNow,
            };

            LogWorkflowGenerationCompleted(businessId, result.Name, result.Steps.Count, stopwatch.ElapsedMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            LogWorkflowGenerationFailed(businessId, ex.Message);
            return new WorkflowGenerationResult
            {
                Success = false,
                ErrorMessage = "Failed to generate workflow. Please try again.",
            };
        }
    }

    /// <inheritdoc />
    public Task<Guid> SaveWorkflowAsync(
        Guid businessId,
        WorkflowGenerationResult workflow,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        // This would save to the database - implementation depends on existing workflow storage
        // For now, return a new GUID as placeholder
        LogWorkflowSaved(businessId, workflow.Name);
        return Task.FromResult(Guid.NewGuid());
    }

    private static string BuildUserPrompt(WorkflowGenerationRequest request)
    {
        var prompt = $"""
            Generate a workflow for the following goal:

            GOAL: {request.GoalDescription}

            TRIGGER TYPE: {request.TriggerType}
            CATEGORY: {request.Category ?? "auto-detect"}
            MAX STEPS: {request.MaxSteps}
            INCLUDE DELAYS: {request.IncludeDelays}
            INCLUDE BRANCHES: {request.IncludeBranches}
            """;

        if (request.DesiredActions?.Count > 0)
        {
            prompt += $"\nDESIRED ACTIONS: {string.Join(", ", request.DesiredActions)}";
        }

        return prompt;
    }

    private static WorkflowGenerationResult ParseWorkflowResponse(string content)
    {
        try
        {
            // Extract JSON from response (may be wrapped in markdown)
            var jsonContent = ExtractJson(content);
            var parsed = JsonSerializer.Deserialize<WorkflowJsonResponse>(jsonContent, JsonOptions);

            if (parsed == null)
            {
                return new WorkflowGenerationResult
                {
                    Success = false,
                    ErrorMessage = "Failed to parse AI response.",
                };
            }

            return new WorkflowGenerationResult
            {
                Name = parsed.Name ?? "Generated Workflow",
                Description = parsed.Description ?? string.Empty,
                Category = parsed.Category ?? "custom",
                Trigger = new WorkflowTriggerDto
                {
                    Type = parsed.Trigger?.Type ?? "lead_created",
                    Description = parsed.Trigger?.Description ?? string.Empty,
                    Conditions = parsed.Trigger?.Conditions,
                },
                Steps = parsed.Steps?.Select(s => new WorkflowStepDto
                {
                    Id = s.Id ?? Guid.NewGuid().ToString("N")[..8],
                    Type = s.Type ?? "action",
                    Name = s.Name ?? "Step",
                    Description = s.Description ?? string.Empty,
                    Icon = s.Icon ?? "⚡",
                    Config = s.Config,
                    NextStepId = s.NextStepId,
                    Branches = s.Branches?.Select(b => new WorkflowBranchDto
                    {
                        Condition = b.Condition ?? string.Empty,
                        NextStepId = b.NextStepId ?? string.Empty,
                    }).ToList(),
                }).ToList() ?? [],
                EstimatedTimeMinutes = parsed.EstimatedTimeMinutes,
            };
        }
        catch (JsonException)
        {
            return new WorkflowGenerationResult
            {
                Success = false,
                ErrorMessage = "Failed to parse workflow structure.",
            };
        }
    }

    private static string ExtractJson(string content)
    {
        // Remove markdown code blocks if present
        var trimmed = content.Trim();
        if (trimmed.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed[7..];
        }
        else if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            trimmed = trimmed[3..];
        }

        if (trimmed.EndsWith("```", StringComparison.Ordinal))
        {
            trimmed = trimmed[..^3];
        }

        return trimmed.Trim();
    }

    // Log methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Starting workflow generation for business {BusinessId}: {Goal} (trigger: {TriggerType})")]
    private partial void LogWorkflowGenerationStarted(Guid businessId, string goal, string triggerType);

    [LoggerMessage(Level = LogLevel.Information, Message = "Workflow generation completed for business {BusinessId}: {Name} with {StepCount} steps in {ElapsedMs}ms")]
    private partial void LogWorkflowGenerationCompleted(Guid businessId, string name, int stepCount, long elapsedMs);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Workflow generation failed for business {BusinessId}: {Error}")]
    private partial void LogWorkflowGenerationFailed(Guid businessId, string error);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI usage limit exceeded for business {BusinessId}")]
    private partial void LogUsageLimitExceeded(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Workflow saved for business {BusinessId}: {Name}")]
    private partial void LogWorkflowSaved(Guid businessId, string name);

    // Internal JSON response classes for deserialization
#pragma warning disable CA1812, S3459, S1144 // Suppress analyzers for JSON deserialization classes
    private sealed record WorkflowJsonResponse(
        string? Name,
        string? Description,
        string? Category,
        TriggerJson? Trigger,
        List<StepJson>? Steps,
        int EstimatedTimeMinutes);

    private sealed record TriggerJson(
        string? Type,
        string? Description,
        Dictionary<string, object>? Conditions);

    private sealed record StepJson(
        string? Id,
        string? Type,
        string? Name,
        string? Description,
        string? Icon,
        Dictionary<string, object>? Config,
        string? NextStepId,
        List<BranchJson>? Branches);

    private sealed record BranchJson(
        string? Condition,
        string? NextStepId);
#pragma warning restore CA1812, S3459, S1144
}

