// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for ChatMessageRepository.
/// </summary>
public partial class ChatMessageRepository
{
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat message {MessageId} for business {BusinessId}")]
    private static partial void LogGettingMessage(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat messages for session {SessionId}, business {BusinessId}, skip={Skip}, take={Take}")]
    private static partial void LogGettingMessages(ILogger logger, Guid sessionId, Guid businessId, int skip, int take);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting chat messages by token {SessionToken}, since={Since}")]
    private static partial void LogGettingMessagesByToken(ILogger logger, string sessionToken, DateTime? since);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding chat message to session {SessionId}, type={Type}")]
    private static partial void LogAddingMessage(ILogger logger, Guid sessionId, string type);

    [LoggerMessage(Level = LogLevel.Information, Message = "Marking messages as read for session {SessionId} by {ReaderId}")]
    private static partial void LogMarkingAsRead(ILogger logger, Guid sessionId, string readerId);
}

