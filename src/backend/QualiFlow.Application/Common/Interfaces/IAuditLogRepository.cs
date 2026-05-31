// <copyright file="IAuditLogRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Common.Models;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for audit log operations.
/// </summary>
public interface IAuditLogRepository
{
    /// <summary>
    /// Creates a new audit log entry.
    /// </summary>
    /// <param name="auditLog">The audit log to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an audit log by ID.
    /// </summary>
    /// <param name="auditLogId">The audit log ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The audit log if found, otherwise null.</returns>
    Task<AuditLog?> GetByIdAsync(Guid auditLogId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated audit logs for a business with optional filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">Optional user ID filter.</param>
    /// <param name="entityType">Optional entity type filter.</param>
    /// <param name="entityId">Optional entity ID filter.</param>
    /// <param name="action">Optional action filter.</param>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated audit logs.</returns>
    Task<PagedResult<AuditLog>> GetPagedAsync(
        Guid businessId,
        Guid? userId = null,
        string? entityType = null,
        Guid? entityId = null,
        AuditAction? action = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit logs for a specific entity.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="entityType">The entity type.</param>
    /// <param name="entityId">The entity ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of audit logs for the entity.</returns>
    Task<IReadOnlyList<AuditLog>> GetEntityHistoryAsync(
        Guid businessId,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit logs for a specific user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of audit logs for the user.</returns>
    Task<IReadOnlyList<AuditLog>> GetUserActivityAsync(
        Guid businessId,
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes old audit logs (for data retention compliance).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="olderThan">Delete logs older than this date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of deleted audit logs.</returns>
    Task<int> DeleteOldLogsAsync(
        Guid businessId,
        DateTime olderThan,
        CancellationToken cancellationToken = default);
}

