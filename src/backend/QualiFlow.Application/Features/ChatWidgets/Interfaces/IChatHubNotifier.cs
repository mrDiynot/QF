// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.ChatWidgets.DTOs;

namespace QualiFlow.Application.Features.ChatWidgets.Interfaces;

/// <summary>
/// Interface for broadcasting chat events via SignalR.
/// </summary>
public interface IChatHubNotifier
{
    /// <summary>
    /// Broadcasts an AI response to all clients in a chat session.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="message">The AI message to broadcast.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task BroadcastAIResponseAsync(Guid sessionId, ChatMessageDto message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts a typing indicator to all clients in a chat session.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="isTyping">Whether someone is typing.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task BroadcastTypingIndicatorAsync(Guid sessionId, bool isTyping, CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts a streaming AI response token to all clients in a chat session.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="messageId">The message ID being streamed.</param>
    /// <param name="token">The token chunk.</param>
    /// <param name="isComplete">Whether this is the final token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task BroadcastAIStreamTokenAsync(Guid sessionId, Guid messageId, string token, bool isComplete, CancellationToken cancellationToken = default);
}
