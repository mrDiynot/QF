using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.API.Hubs;

/// <summary>
/// SignalR hub for real-time conversation and message broadcasting.
/// Handles WebSocket connections for live messaging, typing indicators, and online status.
/// Implements multi-tenancy by grouping connections by business ID.
/// Uses strongly-typed client interface for type-safe client method calls.
/// </summary>
[Authorize]
public partial class ConversationHub : Hub<IConversationHubClient>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ConversationHub> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationHub"/> class.
    /// </summary>
    /// <param name="currentUserService">Service for accessing current user context.</param>
    /// <param name="logger">Logger for logging SignalR events.</param>
    public ConversationHub(
        ICurrentUserService currentUserService,
        ILogger<ConversationHub> logger)
    {
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// Automatically adds the connection to the business group for multi-tenancy isolation.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public override async Task OnConnectedAsync()
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var userId = _currentUserService.GetUserId();
            var userEmail = _currentUserService.GetUserEmail();

            // Add connection to business group (multi-tenancy)
            var businessGroupName = $"business_{businessId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, businessGroupName);

            LogUserConnected(_logger, Context.ConnectionId, userId, userEmail, businessId);

            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            LogConnectionError(_logger, Context.ConnectionId, ex);
            throw;
        }
    }

    /// <summary>
    /// Called when a client disconnects from the hub.
    /// Removes the connection from all groups and broadcasts offline status.
    /// </summary>
    /// <param name="exception">The exception that caused the disconnection, if any.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var userId = _currentUserService.GetUserId();

            LogUserDisconnected(_logger, Context.ConnectionId, userId, businessId, exception);

            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            LogDisconnectionError(_logger, Context.ConnectionId, ex);
        }
    }

    /// <summary>
    /// Joins a specific conversation room.
    /// Allows the client to receive real-time updates for a specific conversation.
    /// </summary>
    /// <param name="conversationId">The ID of the conversation to join.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task JoinConversationAsync(Guid conversationId)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var conversationGroupName = $"conversation_{conversationId}";

            await Groups.AddToGroupAsync(Context.ConnectionId, conversationGroupName);

            // Add user to their personal group for targeted notifications
            var userId = _currentUserService.GetUserId();
            var userGroupName = $"user_{businessId}_{userId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, userGroupName);

            LogJoinedConversation(_logger, Context.ConnectionId, conversationId, businessId);

            // Notify other users in the conversation that someone joined
            await Clients.OthersInGroup(conversationGroupName)
                .UserJoinedConversation(conversationId, _currentUserService.GetUserEmail());
        }
        catch (Exception ex)
        {
            LogJoinConversationError(_logger, Context.ConnectionId, conversationId, ex);
            throw;
        }
    }

    /// <summary>
    /// Leaves a specific conversation room.
    /// Stops receiving real-time updates for the conversation.
    /// </summary>
    /// <param name="conversationId">The ID of the conversation to leave.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task LeaveConversationAsync(Guid conversationId)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var conversationGroupName = $"conversation_{conversationId}";

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationGroupName);

            LogLeftConversation(_logger, Context.ConnectionId, conversationId, businessId);

            // Notify other users in the conversation that someone left
            await Clients.OthersInGroup(conversationGroupName)
                .UserLeftConversation(conversationId, _currentUserService.GetUserEmail());
        }
        catch (Exception ex)
        {
            LogLeaveConversationError(_logger, Context.ConnectionId, conversationId, ex);
            throw;
        }
    }

    /// <summary>
    /// Sends a typing indicator to other users in the conversation.
    /// </summary>
    /// <param name="conversationId">The ID of the conversation where the user is typing.</param>
    /// <param name="isTyping">True if the user is typing; false if they stopped.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task SendTypingIndicatorAsync(Guid conversationId, bool isTyping)
    {
        try
        {
            var conversationGroupName = $"conversation_{conversationId}";
            var userEmail = _currentUserService.GetUserEmail();

            // Broadcast typing indicator to other users in the conversation using strongly-typed client
            var typingEvent = new Application.Features.RealTime.DTOs.TypingIndicatorEvent
            {
                ConversationId = conversationId,
                UserEmail = userEmail,
                IsTyping = isTyping,
                Timestamp = DateTime.UtcNow,
            };
            await Clients.OthersInGroup(conversationGroupName).TypingIndicator(typingEvent);
        }
        catch (Exception ex)
        {
            LogTypingIndicatorError(_logger, Context.ConnectionId, conversationId, ex);
        }
    }

    // ============================================================================
    // LoggerMessage Delegates (High-Performance Logging)
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "User connected: ConnectionId={ConnectionId}, UserId={UserId}, Email={Email}, BusinessId={BusinessId}")]
    private static partial void LogUserConnected(ILogger logger, string connectionId, Guid? userId, string? email, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User disconnected: ConnectionId={ConnectionId}, UserId={UserId}, BusinessId={BusinessId}")]
    private static partial void LogUserDisconnected(ILogger logger, string connectionId, Guid? userId, Guid businessId, Exception? exception);

    [LoggerMessage(Level = LogLevel.Information, Message = "User joined conversation: ConnectionId={ConnectionId}, ConversationId={ConversationId}, BusinessId={BusinessId}")]
    private static partial void LogJoinedConversation(ILogger logger, string connectionId, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User left conversation: ConnectionId={ConnectionId}, ConversationId={ConversationId}, BusinessId={BusinessId}")]
    private static partial void LogLeftConversation(ILogger logger, string connectionId, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error during connection: ConnectionId={ConnectionId}")]
    private static partial void LogConnectionError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error during disconnection: ConnectionId={ConnectionId}")]
    private static partial void LogDisconnectionError(ILogger logger, string connectionId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error joining conversation: ConnectionId={ConnectionId}, ConversationId={ConversationId}")]
    private static partial void LogJoinConversationError(ILogger logger, string connectionId, Guid conversationId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error leaving conversation: ConnectionId={ConnectionId}, ConversationId={ConversationId}")]
    private static partial void LogLeaveConversationError(ILogger logger, string connectionId, Guid conversationId, Exception exception);

    [LoggerMessage(Level = LogLevel.Error, Message = "Error sending typing indicator: ConnectionId={ConnectionId}, ConversationId={ConversationId}")]
    private static partial void LogTypingIndicatorError(ILogger logger, string connectionId, Guid conversationId, Exception exception);
}

