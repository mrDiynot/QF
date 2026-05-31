// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.ChatWidgets.Services;

namespace QualiFlow.API.Hubs;

/// <summary>
/// Public SignalR hub for anonymous chat widget sessions.
/// Does NOT require authentication - uses session tokens for identification.
/// </summary>
[AllowAnonymous]
public partial class PublicChatHub : Hub<IPublicChatHubClient>
{
    private readonly IChatSessionService _sessionService;
    private readonly ILogger<PublicChatHub> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublicChatHub"/> class.
    /// </summary>
    /// <param name="sessionService">Chat session service.</param>
    /// <param name="logger">Logger instance.</param>
    public PublicChatHub(
        IChatSessionService sessionService,
        ILogger<PublicChatHub> logger)
    {
        _sessionService = sessionService;
        _logger = logger;
    }

    /// <summary>
    /// Joins a chat session using the session token.
    /// </summary>
    /// <param name="sessionToken">The session token from StartSession.</param>
    /// <returns>True if joined successfully.</returns>
    public async Task<bool> JoinSessionAsync(string sessionToken)
    {
        try
        {
            var session = await _sessionService.GetBySessionTokenAsync(sessionToken, CancellationToken.None);
            if (session == null)
            {
                LogInvalidSessionToken(_logger, Context.ConnectionId, sessionToken);
                return false;
            }

            var sessionGroup = $"chat_session_{session.Id}";
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionGroup);

            // Store session token in connection context
            Context.Items["SessionToken"] = sessionToken;
            Context.Items["SessionId"] = session.Id;

            LogSessionJoined(_logger, Context.ConnectionId, session.Id);
            return true;
        }
        catch (Exception ex)
        {
            LogJoinSessionError(_logger, Context.ConnectionId, ex);
            return false;
        }
    }

    /// <summary>
    /// Sends a message from the visitor.
    /// </summary>
    /// <param name="content">Message content.</param>
    /// <returns>The sent message DTO or null if failed.</returns>
    public async Task<ChatMessageDto?> SendMessageAsync(string content)
    {
        try
        {
            var sessionToken = Context.Items["SessionToken"] as string;
            if (string.IsNullOrEmpty(sessionToken))
            {
                LogNoSessionToken(_logger, Context.ConnectionId);
                return null;
            }

            var request = new SendChatMessageRequest
            {
                SessionToken = sessionToken,
                Content = content,
            };

            var message = await _sessionService.SendMessageAsync(request, CancellationToken.None);
            if (message == null)
            {
                return null;
            }

            // Broadcast to session group (for agents monitoring)
            var sessionId = Context.Items["SessionId"] as Guid?;
            if (sessionId.HasValue)
            {
                var sessionGroup = $"chat_session_{sessionId.Value}";
                await Clients.OthersInGroup(sessionGroup).ReceiveMessage(message);
            }

            LogMessageSent(_logger, Context.ConnectionId, message.Id);
            return message;
        }
        catch (Exception ex)
        {
            LogSendMessageError(_logger, Context.ConnectionId, ex);
            return null;
        }
    }

    /// <summary>
    /// Sends typing indicator to the session.
    /// </summary>
    /// <param name="isTyping">Whether the visitor is typing.</param>
    /// <returns>A task representing the async operation.</returns>
    public async Task SendTypingIndicatorAsync(bool isTyping)
    {
        try
        {
            var sessionId = Context.Items["SessionId"] as Guid?;
            if (!sessionId.HasValue)
            {
                return;
            }

            var sessionGroup = $"chat_session_{sessionId.Value}";
            await Clients.OthersInGroup(sessionGroup).TypingIndicator(sessionId.Value, isTyping);
        }
        catch (Exception ex)
        {
            LogTypingIndicatorError(_logger, Context.ConnectionId, ex);
        }
    }

    /// <summary>
    /// Ends the chat session.
    /// </summary>
    /// <param name="reason">Optional reason for ending.</param>
    /// <returns>True if ended successfully.</returns>
    public async Task<bool> EndSessionAsync(string? reason = null)
    {
        try
        {
            var sessionToken = Context.Items["SessionToken"] as string;
            if (string.IsNullOrEmpty(sessionToken))
            {
                return false;
            }

            var request = new EndChatSessionRequest
            {
                SessionToken = sessionToken,
                Reason = reason,
            };

            var result = await _sessionService.EndSessionAsync(request, CancellationToken.None);
            if (result)
            {
                var sessionId = Context.Items["SessionId"] as Guid?;
                if (sessionId.HasValue)
                {
                    var sessionGroup = $"chat_session_{sessionId.Value}";
                    await Clients.OthersInGroup(sessionGroup).SessionEnded(sessionId.Value, reason);
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionGroup);
                }

                LogSessionEnded(_logger, Context.ConnectionId, sessionId ?? Guid.Empty);
            }

            return result;
        }
        catch (Exception ex)
        {
            LogEndSessionError(_logger, Context.ConnectionId, ex);
            return false;
        }
    }

    /// <inheritdoc />
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var sessionId = Context.Items["SessionId"] as Guid?;
        if (sessionId.HasValue)
        {
            LogVisitorDisconnected(_logger, Context.ConnectionId, sessionId.Value, exception);
        }

        await base.OnDisconnectedAsync(exception);
    }

    // LoggerMessage delegates
    [LoggerMessage(EventId = 25001, Level = LogLevel.Warning, Message = "Invalid session token: ConnectionId={ConnectionId}, Token={Token}")]
    private static partial void LogInvalidSessionToken(ILogger logger, string connectionId, string token);

    [LoggerMessage(EventId = 25002, Level = LogLevel.Information, Message = "Session joined: ConnectionId={ConnectionId}, SessionId={SessionId}")]
    private static partial void LogSessionJoined(ILogger logger, string connectionId, Guid sessionId);

    [LoggerMessage(EventId = 25003, Level = LogLevel.Error, Message = "Error joining session: ConnectionId={ConnectionId}")]
    private static partial void LogJoinSessionError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(EventId = 25004, Level = LogLevel.Warning, Message = "No session token in context: ConnectionId={ConnectionId}")]
    private static partial void LogNoSessionToken(ILogger logger, string connectionId);

    [LoggerMessage(EventId = 25005, Level = LogLevel.Information, Message = "Message sent: ConnectionId={ConnectionId}, MessageId={MessageId}")]
    private static partial void LogMessageSent(ILogger logger, string connectionId, Guid messageId);

    [LoggerMessage(EventId = 25006, Level = LogLevel.Error, Message = "Error sending message: ConnectionId={ConnectionId}")]
    private static partial void LogSendMessageError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(EventId = 25007, Level = LogLevel.Error, Message = "Error sending typing indicator: ConnectionId={ConnectionId}")]
    private static partial void LogTypingIndicatorError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(EventId = 25008, Level = LogLevel.Information, Message = "Session ended: ConnectionId={ConnectionId}, SessionId={SessionId}")]
    private static partial void LogSessionEnded(ILogger logger, string connectionId, Guid sessionId);

    [LoggerMessage(EventId = 25009, Level = LogLevel.Error, Message = "Error ending session: ConnectionId={ConnectionId}")]
    private static partial void LogEndSessionError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(EventId = 25010, Level = LogLevel.Information, Message = "Visitor disconnected: ConnectionId={ConnectionId}, SessionId={SessionId}")]
    private static partial void LogVisitorDisconnected(ILogger logger, string connectionId, Guid sessionId, Exception? exception);
}
