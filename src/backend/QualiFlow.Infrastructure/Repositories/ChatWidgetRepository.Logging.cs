// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for ChatWidgetRepository.
/// </summary>
public partial class ChatWidgetRepository
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat widget {WidgetId} for business {BusinessId}")]
    private static partial void LogGettingWidget(ILogger logger, Guid widgetId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat widget by key {WidgetKey}")]
    private static partial void LogGettingWidgetByKey(ILogger logger, string widgetKey);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat widgets for business {BusinessId}, isActive={IsActive}, skip={Skip}, take={Take}")]
    private static partial void LogGettingWidgets(ILogger logger, Guid businessId, bool? isActive, int skip, int take);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding chat widget {Name} for business {BusinessId}")]
    private static partial void LogAddingWidget(ILogger logger, string name, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating chat widget {WidgetId} for business {BusinessId}")]
    private static partial void LogUpdatingWidget(ILogger logger, Guid widgetId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting chat widget {WidgetId} for business {BusinessId}")]
    private static partial void LogDeletingWidget(ILogger logger, Guid widgetId, Guid businessId);
}

