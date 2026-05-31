// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for ChatSessionRepository.
/// </summary>
public partial class ChatSessionRepository
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat session {SessionId} for business {BusinessId}")]
    private static partial void LogGettingSession(ILogger logger, Guid sessionId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat session by token {SessionToken}")]
    private static partial void LogGettingSessionByToken(ILogger logger, string sessionToken);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat sessions for business {BusinessId}, widgetId={WidgetId}, status={Status}, skip={Skip}, take={Take}")]
    private static partial void LogGettingSessions(ILogger logger, Guid businessId, Guid? widgetId, ChatSessionStatus? status, int skip, int take);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding chat session {SessionToken} for business {BusinessId}")]
    private static partial void LogAddingSession(ILogger logger, string sessionToken, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating chat session {SessionId} for business {BusinessId}")]
    private static partial void LogUpdatingSession(ILogger logger, Guid sessionId, Guid businessId);
}

