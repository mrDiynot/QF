using QualiFlow.Application.Features.RealTime.DTOs;

namespace QualiFlow.Application.Features.RealTime.Services;

/// <summary>
/// Service interface for broadcasting real-time events to connected clients.
/// </summary>
public interface IRealTimeBroadcastService
{
    /// <summary>
    /// Broadcasts a new message to all users in the conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="messageEvent">The new message event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastNewMessageAsync(
        Guid conversationId,
        NewMessageEvent messageEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts read receipts to all users in the conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="readReceiptEvent">The read receipt event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastReadReceiptAsync(
        Guid conversationId,
        ReadReceiptEvent readReceiptEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts a typing indicator to users in the conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="typingEvent">The typing indicator event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastTypingIndicatorAsync(
        Guid conversationId,
        TypingIndicatorEvent typingEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts a user connection status change to all users in the business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="connectionEvent">The connection event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastUserConnectionStatusAsync(
        Guid businessId,
        UserConnectionEvent connectionEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts a message delivery acknowledgment.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="deliveryEvent">The delivery event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastMessageDeliveryAsync(
        Guid conversationId,
        MessageDeliveryEvent deliveryEvent,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts an unread count update to a specific user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID to notify.</param>
    /// <param name="totalUnreadCount">The total unread count.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BroadcastUnreadCountUpdateAsync(
        Guid businessId,
        Guid userId,
        int totalUnreadCount,
        CancellationToken cancellationToken = default);
}

