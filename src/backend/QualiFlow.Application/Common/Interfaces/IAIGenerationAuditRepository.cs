// -----------------------------------------------------------------------
// <copyright file="IAIGenerationAuditRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for AIGenerationAudit entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IAIGenerationAuditRepository
{
    /// <summary>
    /// Gets an audit record by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="auditId">The audit record ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The audit record if found; otherwise, null.</returns>
    Task<AIGenerationAudit?> GetByIdAsync(
        Guid businessId,
        Guid auditId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated audit records for a business with optional filters.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="taskType">Optional filter by task type.</param>
    /// <param name="userId">Optional filter by user ID.</param>
    /// <param name="startDate">Optional filter for records after this date.</param>
    /// <param name="endDate">Optional filter for records before this date.</param>
    /// <param name="skip">Number of records to skip.</param>
    /// <param name="take">Maximum records to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of audit records.</returns>
    Task<IReadOnlyList<AIGenerationAudit>> GetAllAsync(
        Guid businessId,
        string? taskType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of audit records matching the filters.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="taskType">Optional filter by task type.</param>
    /// <param name="userId">Optional filter by user ID.</param>
    /// <param name="startDate">Optional filter for records after this date.</param>
    /// <param name="endDate">Optional filter for records before this date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The count of matching records.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        string? taskType = null,
        Guid? userId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new audit record to the database.
    /// </summary>
    /// <param name="audit">The audit record to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added audit record with generated ID.</returns>
    Task<AIGenerationAudit> AddAsync(
        AIGenerationAudit audit,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates feedback on an existing audit record.
    /// </summary>
    /// <param name="audit">The audit record to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateFeedbackAsync(
        AIGenerationAudit audit,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets aggregated usage statistics for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="startDate">Start date for the aggregation period.</param>
    /// <param name="endDate">End date for the aggregation period.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Aggregated usage statistics.</returns>
    Task<AIUsageStatistics> GetUsageStatisticsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets usage breakdown by task type for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="startDate">Start date for the aggregation period.</param>
    /// <param name="endDate">End date for the aggregation period.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Usage breakdown grouped by task type.</returns>
    Task<IReadOnlyList<TaskTypeUsage>> GetUsageByTaskTypeAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets feedback analytics for a business within a date range.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="startDate">Start date for the aggregation period.</param>
    /// <param name="endDate">End date for the aggregation period.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Feedback analytics data.</returns>
    Task<FeedbackAnalytics> GetFeedbackAnalyticsAsync(
        Guid businessId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Aggregated AI usage statistics.
/// </summary>
public record AIUsageStatistics(
    int TotalGenerations,
    int SuccessfulGenerations,
    int FailedGenerations,
    int TotalInputTokens,
    int TotalOutputTokens,
    decimal TotalCostUsd,
    double AverageLatencyMs);

/// <summary>
/// Usage breakdown by task type.
/// </summary>
public record TaskTypeUsage(
    string TaskType,
    int Count,
    int TotalTokens,
    decimal CostUsd);

/// <summary>
/// Feedback analytics summary.
/// </summary>
public record FeedbackAnalytics(
    int TotalWithFeedback,
    int AcceptedCount,
    int ModifiedCount,
    int RejectedCount,
    int ThumbsUpCount,
    int ThumbsDownCount);

