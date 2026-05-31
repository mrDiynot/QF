// <copyright file="DataExportService.Logging.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Logging partial class for DataExportService.
/// </summary>
public partial class DataExportService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Export started for business {BusinessId}, entity type: {EntityType}, format: {Format}")]
    private static partial void LogExportStarted(
        ILogger logger,
        Guid businessId,
        string entityType,
        string format);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Import started for business {BusinessId}, entity type: {EntityType}, file: {FileName}")]
    private static partial void LogImportStarted(
        ILogger logger,
        Guid businessId,
        string entityType,
        string fileName);

    [LoggerMessage(
        EventId = 3,
        Level = LogLevel.Information,
        Message = "Import completed for business {BusinessId}, entity type: {EntityType}, imported: {ImportedCount}, skipped: {SkippedCount}, failed: {FailedCount}")]
    private static partial void LogImportCompleted(
        ILogger logger,
        Guid businessId,
        string entityType,
        int importedCount,
        int skippedCount,
        int failedCount);
}

