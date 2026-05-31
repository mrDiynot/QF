// -----------------------------------------------------------------------
// <copyright file="AIFeedbackService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service implementation for recording and analyzing AI generation feedback.
/// </summary>
public sealed partial class AIFeedbackService(
    IAIGenerationAuditRepository repository,
    ILogger<AIFeedbackService> logger) : IAIFeedbackService
{
    /// <inheritdoc />
    public async Task<bool> RecordFeedbackAsync(
        RecordFeedbackRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogRecordingFeedback(logger, request.AuditId, request.FeedbackType);

        // Validate feedback type
        if (!Enum.TryParse<AIFeedbackType>(request.FeedbackType, ignoreCase: true, out var feedbackType))
        {
            LogInvalidFeedbackType(logger, request.FeedbackType);
            return false;
        }

        // Get the audit record
        var audit = await repository.GetByIdAsync(request.BusinessId, request.AuditId, cancellationToken);
        if (audit == null)
        {
            LogAuditNotFound(logger, request.AuditId);
            return false;
        }

        // Update feedback
        audit.Feedback = feedbackType;
        audit.FeedbackComment = request.Comment;
        audit.FeedbackAt = DateTime.UtcNow;
        audit.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateFeedbackAsync(audit, cancellationToken);

        LogFeedbackRecorded(logger, request.AuditId, feedbackType);

        return true;
    }

    /// <inheritdoc />
    public async Task<AIQualityMetricsResponse> GetQualityMetricsAsync(
        GetQualityMetricsRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        LogGettingQualityMetrics(logger, request.BusinessId, request.StartDate, request.EndDate);

        // Get all audits in the date range
        var audits = await repository.GetAllAsync(
            request.BusinessId,
            request.TaskType,
            userId: null,
            request.StartDate,
            request.EndDate,
            skip: 0,
            take: int.MaxValue,
            cancellationToken);

        var withFeedback = audits.Where(a => a.Feedback.HasValue).ToList();
        var totalWithFeedback = withFeedback.Count;

        // Calculate overall metrics
        var acceptedCount = withFeedback.Count(a => a.Feedback == AIFeedbackType.Accepted);
        var modifiedCount = withFeedback.Count(a => a.Feedback == AIFeedbackType.Modified);
        var rejectedCount = withFeedback.Count(a => a.Feedback == AIFeedbackType.Rejected);
        var thumbsUpCount = withFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsUp);
        var thumbsDownCount = withFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsDown);

        var acceptanceRate = totalWithFeedback > 0
            ? (float)(acceptedCount + modifiedCount + thumbsUpCount) / totalWithFeedback
            : 0f;

        var rejectionRate = totalWithFeedback > 0
            ? (float)(rejectedCount + thumbsDownCount) / totalWithFeedback
            : 0f;

        var satisfactionScore = CalculateSatisfactionScore(thumbsUpCount, thumbsDownCount, acceptedCount, rejectedCount);

        // Group by task type
        var metricsByTaskType = audits
            .GroupBy(a => a.TaskType)
            .Select(g => BuildTaskTypeMetrics(g.Key, g.ToList()))
            .ToList();

        return new AIQualityMetricsResponse
        {
            BusinessId = request.BusinessId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalWithFeedback = totalWithFeedback,
            AcceptanceRate = acceptanceRate,
            RejectionRate = rejectionRate,
            SatisfactionScore = satisfactionScore,
            MetricsByTaskType = metricsByTaskType,
        };
    }

    /// <inheritdoc />
    public async Task<FeedbackSummaryResponse> GetFeedbackSummaryAsync(
        Guid businessId,
        int daysBack = 30,
        CancellationToken cancellationToken = default)
    {
        LogGettingFeedbackSummary(logger, businessId, daysBack);

        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddDays(-daysBack);
        var previousStartDate = startDate.AddDays(-daysBack);

        // Current period
        var currentAudits = await repository.GetAllAsync(
            businessId, taskType: null, userId: null, startDate, endDate, 0, int.MaxValue, cancellationToken);

        // Previous period for trend calculation
        var previousAudits = await repository.GetAllAsync(
            businessId, taskType: null, userId: null, previousStartDate, startDate, 0, int.MaxValue, cancellationToken);

        var currentWithFeedback = currentAudits.Where(a => a.Feedback.HasValue).ToList();
        var previousWithFeedback = previousAudits.Where(a => a.Feedback.HasValue).ToList();

        var currentAcceptance = CalculateAcceptanceRate(currentWithFeedback);
        var previousAcceptance = CalculateAcceptanceRate(previousWithFeedback);
        var trend = currentAcceptance - previousAcceptance;

        var counts = new FeedbackCounts(
            currentWithFeedback.Count(a => a.Feedback == AIFeedbackType.Accepted),
            currentWithFeedback.Count(a => a.Feedback == AIFeedbackType.Modified),
            currentWithFeedback.Count(a => a.Feedback == AIFeedbackType.Rejected),
            currentWithFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsUp),
            currentWithFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsDown));

        return new FeedbackSummaryResponse
        {
            BusinessId = businessId,
            DaysBack = daysBack,
            TotalGenerations = currentAudits.Count,
            WithFeedback = currentWithFeedback.Count,
            Counts = counts,
            AcceptanceRateTrend = trend,
        };
    }

    // ========================================
    // Helper Methods
    // ========================================

    private static TaskTypeQualityMetrics BuildTaskTypeMetrics(string taskType, List<Domain.Entities.AIGenerationAudit> audits)
    {
        var withFeedback = audits.Where(a => a.Feedback.HasValue).ToList();
        var total = audits.Count;
        var feedbackCount = withFeedback.Count;

        var accepted = withFeedback.Count(a => a.Feedback == AIFeedbackType.Accepted);
        var modified = withFeedback.Count(a => a.Feedback == AIFeedbackType.Modified);
        var rejected = withFeedback.Count(a => a.Feedback == AIFeedbackType.Rejected);
        var thumbsUp = withFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsUp);
        var thumbsDown = withFeedback.Count(a => a.Feedback == AIFeedbackType.ThumbsDown);

        var acceptanceRate = feedbackCount > 0
            ? (float)(accepted + modified + thumbsUp) / feedbackCount
            : 0f;

        var satisfactionScore = CalculateSatisfactionScore(thumbsUp, thumbsDown, accepted, rejected);

        return new TaskTypeQualityMetrics(
            taskType,
            total,
            feedbackCount,
            accepted,
            modified,
            rejected,
            thumbsUp,
            thumbsDown,
            acceptanceRate,
            satisfactionScore);
    }

    private static int CalculateSatisfactionScore(int thumbsUp, int thumbsDown, int accepted, int rejected)
    {
        var positive = thumbsUp + accepted;
        var negative = thumbsDown + rejected;
        var total = positive + negative;

        if (total == 0)
        {
            return 0;
        }

        return (int)((float)positive / total * 100);
    }

    private static float CalculateAcceptanceRate(List<Domain.Entities.AIGenerationAudit> withFeedback)
    {
        if (withFeedback.Count == 0)
        {
            return 0f;
        }

        var accepted = withFeedback.Count(a =>
            a.Feedback == AIFeedbackType.Accepted ||
            a.Feedback == AIFeedbackType.Modified ||
            a.Feedback == AIFeedbackType.ThumbsUp);

        return (float)accepted / withFeedback.Count;
    }

    // ========================================
    // Source-generated logging methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Recording feedback for audit {AuditId}: {FeedbackType}")]
    private static partial void LogRecordingFeedback(ILogger logger, Guid auditId, string feedbackType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Invalid feedback type: {FeedbackType}")]
    private static partial void LogInvalidFeedbackType(ILogger logger, string feedbackType);

    [LoggerMessage(Level = LogLevel.Warning, Message = "AI generation audit {AuditId} not found")]
    private static partial void LogAuditNotFound(ILogger logger, Guid auditId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Feedback recorded for audit {AuditId}: {FeedbackType}")]
    private static partial void LogFeedbackRecorded(ILogger logger, Guid auditId, AIFeedbackType feedbackType);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting quality metrics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogGettingQualityMetrics(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting feedback summary for business {BusinessId} over {DaysBack} days")]
    private static partial void LogGettingFeedbackSummary(ILogger logger, Guid businessId, int daysBack);
}

