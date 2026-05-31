using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.RealTime.DTOs;
using QualiFlow.Application.Features.RealTime.Services;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for broadcasting real-time events via SignalR.
/// Uses strongly-typed hub client interface for type-safe client method calls.
/// The hub context is injected and must be registered in the API layer where the actual hub exists.
/// </summary>
/// <param name="hubClients">The hub clients proxy for sending messages to connected clients.</param>
/// <param name="logger">The logger instance.</param>
public partial class RealTimeBroadcastService(
    IHubClients<IConversationHubClient> hubClients,
    ILogger<RealTimeBroadcastService> logger) : IRealTimeBroadcastService
{
    /// <inheritdoc />
    public Task BroadcastNewMessageAsync(
        Guid conversationId,
        NewMessageEvent messageEvent,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetConversationGroupName(conversationId);
        LogBroadcastingNewMessage(logger, conversationId, messageEvent.MessageId);

        return hubClients.Group(groupName).NewMessage(messageEvent);
    }

    /// <inheritdoc />
    public Task BroadcastReadReceiptAsync(
        Guid conversationId,
        ReadReceiptEvent readReceiptEvent,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetConversationGroupName(conversationId);
        LogBroadcastingReadReceipt(logger, conversationId, readReceiptEvent.MessageIds.Count);

        return hubClients.Group(groupName).ReadReceipt(readReceiptEvent);
    }

    /// <inheritdoc />
    public Task BroadcastTypingIndicatorAsync(
        Guid conversationId,
        TypingIndicatorEvent typingEvent,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetConversationGroupName(conversationId);
        LogBroadcastingTypingIndicator(logger, conversationId, typingEvent.UserEmail, typingEvent.IsTyping);

        return hubClients.Group(groupName).TypingIndicator(typingEvent);
    }

    /// <inheritdoc />
    public Task BroadcastUserConnectionStatusAsync(
        Guid businessId,
        UserConnectionEvent connectionEvent,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetBusinessGroupName(businessId);
        LogBroadcastingConnectionStatus(logger, businessId, connectionEvent.UserId, connectionEvent.IsOnline);

        return hubClients.Group(groupName).UserConnectionStatus(connectionEvent);
    }

    /// <inheritdoc />
    public Task BroadcastMessageDeliveryAsync(
        Guid conversationId,
        MessageDeliveryEvent deliveryEvent,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetConversationGroupName(conversationId);
        LogBroadcastingDelivery(logger, conversationId, deliveryEvent.MessageId, deliveryEvent.Status);

        return hubClients.Group(groupName).MessageDelivery(deliveryEvent);
    }

    /// <inheritdoc />
    public Task BroadcastUnreadCountUpdateAsync(
        Guid businessId,
        Guid userId,
        int totalUnreadCount,
        CancellationToken cancellationToken = default)
    {
        var groupName = GetUserGroupName(businessId, userId);
        LogBroadcastingUnreadCount(logger, businessId, userId, totalUnreadCount);

        return hubClients.Group(groupName).UnreadCountUpdate(userId, totalUnreadCount);
    }

    private static string GetConversationGroupName(Guid conversationId) => $"conversation_{conversationId}";

    private static string GetBusinessGroupName(Guid businessId) => $"business_{businessId}";

    private static string GetUserGroupName(Guid businessId, Guid userId) => $"user_{businessId}_{userId}";

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting new message to conversation {ConversationId}, MessageId={MessageId}")]
    private static partial void LogBroadcastingNewMessage(ILogger logger, Guid conversationId, Guid messageId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting read receipt to conversation {ConversationId}, Count={MessageCount}")]
    private static partial void LogBroadcastingReadReceipt(ILogger logger, Guid conversationId, int messageCount);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting typing indicator to conversation {ConversationId}, User={UserEmail}, IsTyping={IsTyping}")]
    private static partial void LogBroadcastingTypingIndicator(ILogger logger, Guid conversationId, string? userEmail, bool isTyping);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting connection status to business {BusinessId}, UserId={UserId}, IsOnline={IsOnline}")]
    private static partial void LogBroadcastingConnectionStatus(ILogger logger, Guid businessId, Guid userId, bool isOnline);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting delivery status to conversation {ConversationId}, MessageId={MessageId}, Status={Status}")]
    private static partial void LogBroadcastingDelivery(ILogger logger, Guid conversationId, Guid messageId, string status);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Broadcasting unread count to business {BusinessId}, UserId={UserId}, Count={TotalUnreadCount}")]
    private static partial void LogBroadcastingUnreadCount(ILogger logger, Guid businessId, Guid userId, int totalUnreadCount);
}

