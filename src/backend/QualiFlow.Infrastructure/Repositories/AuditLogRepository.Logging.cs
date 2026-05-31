// <copyright file="AuditLogRepository.Logging.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for AuditLogRepository.
/// </summary>
public partial class AuditLogRepository
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Audit log created: {AuditLogId}, EntityType: {EntityType}, Action: {Action}")]
    private static partial void LogAuditLogCreated(
        ILogger logger,
        Guid auditLogId,
        string entityType,
        AuditAction action);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Retrieved {Count} audit logs for business {BusinessId}, Total: {TotalItems}")]
    private static partial void LogAuditLogsRetrieved(
        ILogger logger,
        Guid businessId,
        int count,
        int totalItems);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Retrieved {Count} audit logs for entity {EntityType} {EntityId}")]
    private static partial void LogEntityHistoryRetrieved(
        ILogger logger,
        string entityType,
        Guid entityId,
        int count);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Deleted {Count} old audit logs for business {BusinessId} older than {OlderThan}")]
    private static partial void LogOldLogsDeleted(
        ILogger logger,
        Guid businessId,
        int count,
        DateTime olderThan);
}

