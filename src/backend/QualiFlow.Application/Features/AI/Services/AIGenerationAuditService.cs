// -----------------------------------------------------------------------
// <copyright file="AIGenerationAuditService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service implementation for AI generation audit logging and analytics.
/// </summary>
public partial class AIGenerationAuditService(
    IAIGenerationAuditRepository repository,
    ILogger<AIGenerationAuditService> logger) : IAIGenerationAuditService
{
    /// <inheritdoc />
    public async Task<LogAIGenerationResponse> LogAIGenerationAsync(
        LogAIGenerationRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogLoggingGeneration(logger, request.TaskType, request.BusinessId);

        var audit = new AIGenerationAudit
        {
            BusinessId = request.BusinessId,
            UserId = request.UserId,
            TaskType = request.TaskType.ToString(),
            InputPrompt = request.InputPrompt,
            OutputJson = request.OutputJson,
            InputTokens = request.InputTokens,
            OutputTokens = request.OutputTokens,
            ModelUsed = request.ModelUsed,
            DurationMs = request.DurationMs,
            EstimatedCostUsd = request.EstimatedCostUsd,
            IsSuccess = request.IsSuccess,
            ErrorMessage = request.ErrorMessage,
            Metadata = request.Metadata,
        };

        var created = await repository.AddAsync(audit, cancellationToken);

        LogGenerationLogged(logger, created.Id, request.TaskType);

        return new LogAIGenerationResponse
        {
            AuditId = created.Id,
            CreatedAt = created.CreatedAt,
        };
    }

    /// <inheritdoc />
    public async Task<bool> UpdateFeedbackAsync(
        Guid businessId,
        UpdateAIFeedbackRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var audit = await repository.GetByIdAsync(businessId, request.AuditId, cancellationToken);
        if (audit == null)
        {
            LogAuditNotFound(logger, request.AuditId);
            return false;
        }

        if (!Enum.TryParse<AIFeedbackType>(request.FeedbackType, ignoreCase: true, out var feedbackType))
        {
            LogInvalidFeedbackType(logger, request.FeedbackType);
            return false;
        }

        audit.Feedback = feedbackType;
        audit.FeedbackComment = request.Comment;
        audit.FeedbackAt = DateTime.UtcNow;
        audit.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateFeedbackAsync(audit, cancellationToken);

        LogFeedbackUpdated(logger, request.AuditId, feedbackType);

        return true;
    }

    /// <inheritdoc />
    public async Task<AIUsageAnalyticsResponse> GetAIUsageAnalyticsAsync(
        GetAIUsageAnalyticsRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogGettingAnalytics(logger, request.BusinessId, request.StartDate, request.EndDate);

        var stats = await repository.GetUsageStatisticsAsync(
            request.BusinessId,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        var taskTypeUsage = await repository.GetUsageByTaskTypeAsync(
            request.BusinessId,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        var feedback = await repository.GetFeedbackAnalyticsAsync(
            request.BusinessId,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        var successRate = stats.TotalGenerations > 0
            ? (float)stats.SuccessfulGenerations / stats.TotalGenerations
            : 0f;

        var acceptanceRate = feedback.TotalWithFeedback > 0
            ? (float)(feedback.AcceptedCount + feedback.ThumbsUpCount) / feedback.TotalWithFeedback
            : 0f;

        return new AIUsageAnalyticsResponse
        {
            BusinessId = request.BusinessId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalGenerations = stats.TotalGenerations,
            SuccessfulGenerations = stats.SuccessfulGenerations,
            FailedGenerations = stats.FailedGenerations,
            SuccessRate = successRate,
            TotalInputTokens = stats.TotalInputTokens,
            TotalOutputTokens = stats.TotalOutputTokens,
            TotalCostUsd = stats.TotalCostUsd,
            AverageLatencyMs = stats.AverageLatencyMs,
            UsageByTaskType = taskTypeUsage.Select(t => new TaskTypeUsageDto(
                t.TaskType, t.Count, t.TotalTokens, t.CostUsd)).ToList(),
            FeedbackAnalytics = new FeedbackAnalyticsDto(
                feedback.TotalWithFeedback,
                feedback.AcceptedCount,
                feedback.ModifiedCount,
                feedback.RejectedCount,
                feedback.ThumbsUpCount,
                feedback.ThumbsDownCount,
                acceptanceRate),
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AIGenerationAuditDto>> GetRecentGenerationsAsync(
        Guid businessId,
        string? taskType = null,
        int skip = 0,
        int take = 20,
        CancellationToken cancellationToken = default)
    {
        LogGettingRecentGenerations(logger, businessId, taskType);

        var audits = await repository.GetAllAsync(
            businessId,
            taskType,
            userId: null,
            startDate: null,
            endDate: null,
            skip,
            take,
            cancellationToken);

        return audits.Select(a => new AIGenerationAuditDto
        {
            Id = a.Id,
            TaskType = a.TaskType,
            ModelUsed = a.ModelUsed,
            InputTokens = a.InputTokens,
            OutputTokens = a.OutputTokens,
            DurationMs = a.DurationMs,
            EstimatedCostUsd = a.EstimatedCostUsd,
            IsSuccess = a.IsSuccess,
            Feedback = a.Feedback?.ToString(),
            CreatedAt = a.CreatedAt,
        }).ToList();
    }

    // ========================================
    // Source-generated logging methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Logging AI generation for task {TaskType} in business {BusinessId}")]
    private static partial void LogLoggingGeneration(ILogger logger, AITaskType taskType, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "AI generation logged with ID {AuditId} for task {TaskType}")]
    private static partial void LogGenerationLogged(ILogger logger, Guid auditId, AITaskType taskType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI generation audit {AuditId} not found for feedback update")]
    private static partial void LogAuditNotFound(ILogger logger, Guid auditId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid feedback type: {FeedbackType}")]
    private static partial void LogInvalidFeedbackType(ILogger logger, string feedbackType);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Feedback updated for audit {AuditId} to {FeedbackType}")]
    private static partial void LogFeedbackUpdated(ILogger logger, Guid auditId, AIFeedbackType feedbackType);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting AI usage analytics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogGettingAnalytics(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting recent AI generations for business {BusinessId}, TaskType: {TaskType}")]
    private static partial void LogGettingRecentGenerations(ILogger logger, Guid businessId, string? taskType);
}

