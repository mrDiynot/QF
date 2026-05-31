// <copyright file="AuditLogRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for audit log operations.
/// </summary>
public partial class AuditLogRepository(
    QualiFlowDbContext context,
    ILogger<AuditLogRepository> logger) : IAuditLogRepository
{
    /// <inheritdoc/>
    public async Task CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        await context.AuditLogs.AddAsync(auditLog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        LogAuditLogCreated(logger, auditLog.Id, auditLog.EntityType, auditLog.Action);
    }

    /// <inheritdoc/>
    public async Task<AuditLog?> GetByIdAsync(Guid auditLogId, CancellationToken cancellationToken = default)
    {
        return await context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == auditLogId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AuditLog>> GetPagedAsync(
        Guid businessId,
        Guid? userId = null,
        string? entityType = null,
        Guid? entityId = null,
        AuditAction? action = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.BusinessId == businessId);

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (!string.IsNullOrEmpty(entityType))
        {
            query = query.Where(a => a.EntityType == entityType);
        }

        if (entityId.HasValue)
        {
            query = query.Where(a => a.EntityId == entityId.Value);
        }

        if (action.HasValue)
        {
            query = query.Where(a => a.Action == action.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= endDate.Value);
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        LogAuditLogsRetrieved(logger, businessId, items.Count, totalItems);

        return new PagedResult<AuditLog>
        {
            Items = items,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
        };
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AuditLog>> GetEntityHistoryAsync(
        Guid businessId,
        string entityType,
        Guid entityId,
        CancellationToken cancellationToken = default)
    {
        var logs = await context.AuditLogs
            .AsNoTracking()
            .Include(a => a.User)
            .Where(a => a.BusinessId == businessId &&
                       a.EntityType == entityType &&
                       a.EntityId == entityId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        LogEntityHistoryRetrieved(logger, entityType, entityId, logs.Count);

        return logs;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<AuditLog>> GetUserActivityAsync(
        Guid businessId,
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.AuditLogs
            .AsNoTracking()
            .Where(a => a.BusinessId == businessId && a.UserId == userId);

        if (startDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(a => a.CreatedAt <= endDate.Value);
        }

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> DeleteOldLogsAsync(
        Guid businessId,
        DateTime olderThan,
        CancellationToken cancellationToken = default)
    {
        var logsToDelete = await context.AuditLogs
            .Where(a => a.BusinessId == businessId && a.CreatedAt < olderThan)
            .ToListAsync(cancellationToken);

        context.AuditLogs.RemoveRange(logsToDelete);
        await context.SaveChangesAsync(cancellationToken);

        LogOldLogsDeleted(logger, businessId, logsToDelete.Count, olderThan);

        return logsToDelete.Count;
    }
}

