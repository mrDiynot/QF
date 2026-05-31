// <copyright file="BulkOperationsService.Logging.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Logging partial class for BulkOperationsService.
/// </summary>
public partial class BulkOperationsService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Bulk update started for business {BusinessId}, entity type: {EntityType}, count: {Count}")]
    private static partial void LogBulkUpdateStarted(
        ILogger logger,
        Guid businessId,
        string entityType,
        int count);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Bulk update completed for business {BusinessId}, entity type: {EntityType}, success: {SuccessCount}, failures: {FailureCount}")]
    private static partial void LogBulkUpdateCompleted(
        ILogger logger,
        Guid businessId,
        string entityType,
        int successCount,
        int failureCount);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Bulk delete started for business {BusinessId}, entity type: {EntityType}, count: {Count}, hard delete: {HardDelete}")]
    private static partial void LogBulkDeleteStarted(
        ILogger logger,
        Guid businessId,
        string entityType,
        int count,
        bool hardDelete);

    [LoggerMessage(
        EventId = 4,
        Level = LogLevel.Information,
        Message = "Bulk delete completed for business {BusinessId}, entity type: {EntityType}, success: {SuccessCount}, failures: {FailureCount}")]
    private static partial void LogBulkDeleteCompleted(
        ILogger logger,
        Guid businessId,
        string entityType,
        int successCount,
        int failureCount);
}

