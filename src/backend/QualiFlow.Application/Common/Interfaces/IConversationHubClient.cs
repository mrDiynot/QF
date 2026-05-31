using QualiFlow.Application.Features.RealTime.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Strongly-typed client interface for ConversationHub SignalR methods.
/// Defines the methods that can be called on connected clients.
/// Note: SignalR client methods follow SignalR naming conventions (no Async suffix)
/// as they are called by the client runtime, not by application code.
/// </summary>
[System.Diagnostics.CodeAnalysis.SuppressMessage("Naming", "VSTHRD200:Use 'Async' suffix for async methods", Justification = "SignalR client interface methods follow SignalR conventions")]
public interface IConversationHubClient
{
    /// <summary>
    /// Notifies clients of a new message in a conversation.
    /// </summary>
    /// <param name="messageEvent">The new message event data.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task NewMessage(NewMessageEvent messageEvent);

    /// <summary>
    /// Notifies clients of read receipts.
    /// </summary>
    /// <param name="readReceiptEvent">The read receipt event data.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReadReceipt(ReadReceiptEvent readReceiptEvent);

    /// <summary>
    /// Notifies clients of typing indicators.
    /// </summary>
    /// <param name="typingEvent">The typing indicator event data.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task TypingIndicator(TypingIndicatorEvent typingEvent);

    /// <summary>
    /// Notifies clients of user connection status changes.
    /// </summary>
    /// <param name="connectionEvent">The connection event data.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UserConnectionStatus(UserConnectionEvent connectionEvent);

    /// <summary>
    /// Notifies clients of message delivery status.
    /// </summary>
    /// <param name="deliveryEvent">The delivery event data.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task MessageDelivery(MessageDeliveryEvent deliveryEvent);

    /// <summary>
    /// Notifies clients of unread count updates.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="totalUnreadCount">The total unread count.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UnreadCountUpdate(Guid userId, int totalUnreadCount);

    /// <summary>
    /// Notifies clients that a user joined a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="userEmail">The email of the user who joined.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UserJoinedConversation(Guid conversationId, string? userEmail);

    /// <summary>
    /// Notifies clients that a user left a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="userEmail">The email of the user who left.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UserLeftConversation(Guid conversationId, string? userEmail);
}

