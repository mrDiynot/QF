// <copyright file="GlobalSearchService.Logging.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Logging partial class for GlobalSearchService.
/// </summary>
public partial class GlobalSearchService
{
    [LoggerMessage(
        EventId = 1,
        Level = LogLevel.Information,
        Message = "Global search started for business {BusinessId}, query: '{Query}', entity types: {EntityTypeCount}")]
    private static partial void LogSearchStarted(
        ILogger logger,
        Guid businessId,
        string query,
        int entityTypeCount);

    [LoggerMessage(
        EventId = 2,
        Level = LogLevel.Information,
        Message = "Global search completed for business {BusinessId}, query: '{Query}', total results: {TotalResults}, returned: {ReturnedResults}")]
    private static partial void LogSearchCompleted(
        ILogger logger,
        Guid businessId,
        string query,
        int totalResults,
        int returnedResults);
}

