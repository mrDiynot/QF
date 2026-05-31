// -----------------------------------------------------------------------
// <copyright file="AIGenerationAuditRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for AIGenerationAudit entity operations.
/// Enforces multi-tenancy by filtering all queries by BusinessId.
/// </summary>
public partial class AIGenerationAuditRepository(
    QualiFlowDbContext context,
    ILogger<AIGenerationAuditRepository> logger) : IAIGenerationAuditRepository
{
    /// <inheritdoc />
    public Task<AIGenerationAudit?> GetByIdAsync(
        Guid businessId,
        Guid auditId,
        CancellationToken cancellationToken = default)
    {
        LogGettingAudit(logger, auditId, businessId);

        return context.AIGenerationAudits
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId && a.Id == auditId && a.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<AIGenerationAudit>> GetAllAsync(
        Guid businessId,
        string? taskType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingAudits(logger, businessId, taskType, userId);

        var query = BuildFilteredQuery(businessId, taskType, userId, startDate, endDate);

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        string? taskType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        return BuildFilteredQuery(businessId, taskType, userId, startDate, endDate)
            .CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<AIGenerationAudit> AddAsync(
        AIGenerationAudit audit,
        CancellationToken cancellationToken = default)
    {
        LogCreatingAudit(logger, audit.TaskType, audit.BusinessId);

        context.AIGenerationAudits.Add(audit);
        await context.SaveChangesAsync(cancellationToken);

        return audit;
    }

    /// <inheritdoc />
    public async Task UpdateFeedbackAsync(
        AIGenerationAudit audit,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingFeedback(logger, audit.Id, audit.Feedback);

        context.AIGenerationAudits.Update(audit);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<AIUsageStatistics> GetUsageStatisticsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        LogGettingUsageStats(logger, businessId, startDate, endDate);

        var query = context.AIGenerationAudits
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId &&
                       a.CreatedAt >= startDate &&
                       a.CreatedAt <= endDate &&
                       a.DeletedAt == null);

        var stats = await query
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalGenerations = g.Count(),
                SuccessfulGenerations = g.Count(a => a.IsSuccess),
                FailedGenerations = g.Count(a => !a.IsSuccess),
                TotalInputTokens = g.Sum(a => a.InputTokens),
                TotalOutputTokens = g.Sum(a => a.OutputTokens),
                TotalCostUsd = g.Sum(a => a.EstimatedCostUsd),
                AverageLatencyMs = g.Average(a => (double)a.DurationMs),
            })
            .FirstOrDefaultAsync(cancellationToken);

        return stats != null
            ? new AIUsageStatistics(
                stats.TotalGenerations,
                stats.SuccessfulGenerations,
                stats.FailedGenerations,
                stats.TotalInputTokens,
                stats.TotalOutputTokens,
                stats.TotalCostUsd,
                stats.AverageLatencyMs)
            : new AIUsageStatistics(0, 0, 0, 0, 0, 0m, 0d);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TaskTypeUsage>> GetUsageByTaskTypeAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        return await context.AIGenerationAudits
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId &&
                       a.CreatedAt >= startDate &&
                       a.CreatedAt <= endDate &&
                       a.DeletedAt == null)
            .GroupBy(a => a.TaskType)
            .Select(g => new TaskTypeUsage(
                g.Key,
                g.Count(),
                g.Sum(a => a.InputTokens + a.OutputTokens),
                g.Sum(a => a.EstimatedCostUsd)))
            .OrderByDescending(t => t.Count)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<FeedbackAnalytics> GetFeedbackAnalyticsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var query = context.AIGenerationAudits
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId &&
                       a.CreatedAt >= startDate &&
                       a.CreatedAt <= endDate &&
                       a.Feedback != null &&
                       a.DeletedAt == null);

        var stats = await query
            .GroupBy(_ => 1)
            .Select(g => new
            {
                TotalWithFeedback = g.Count(),
                AcceptedCount = g.Count(a => a.Feedback == AIFeedbackType.Accepted),
                ModifiedCount = g.Count(a => a.Feedback == AIFeedbackType.Modified),
                RejectedCount = g.Count(a => a.Feedback == AIFeedbackType.Rejected),
                ThumbsUpCount = g.Count(a => a.Feedback == AIFeedbackType.ThumbsUp),
                ThumbsDownCount = g.Count(a => a.Feedback == AIFeedbackType.ThumbsDown),
            })
            .FirstOrDefaultAsync(cancellationToken);

        return stats != null
            ? new FeedbackAnalytics(
                stats.TotalWithFeedback,
                stats.AcceptedCount,
                stats.ModifiedCount,
                stats.RejectedCount,
                stats.ThumbsUpCount,
                stats.ThumbsDownCount)
            : new FeedbackAnalytics(0, 0, 0, 0, 0, 0);
    }

    private IQueryable<AIGenerationAudit> BuildFilteredQuery(
        Guid businessId,
        string? taskType,
        Guid? userId,
        DateTime? startDate,
        DateTime? endDate)
    {
        var query = context.AIGenerationAudits
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId && a.DeletedAt == null);

        if (!string.IsNullOrEmpty(taskType))
        {
            query = query.Where(a => a.TaskType == taskType);
        }

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= endDate.Value);
        }

        return query;
    }

    // ========================================
    // Source-generated logging methods
    // ========================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting AI generation audit {AuditId} for business {BusinessId}")]
    private static partial void LogGettingAudit(ILogger logger, Guid auditId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting AI generation audits for business {BusinessId}, TaskType: {TaskType}, UserId: {UserId}")]
    private static partial void LogGettingAudits(ILogger logger, Guid businessId, string? taskType, Guid? userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating AI generation audit for task {TaskType} in business {BusinessId}")]
    private static partial void LogCreatingAudit(ILogger logger, string taskType, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating feedback for audit {AuditId} to {Feedback}")]
    private static partial void LogUpdatingFeedback(ILogger logger, Guid auditId, AIFeedbackType? feedback);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting usage statistics for business {BusinessId} from {StartDate} to {EndDate}")]
    private static partial void LogGettingUsageStats(ILogger logger, Guid businessId, DateTime startDate, DateTime endDate);
}

