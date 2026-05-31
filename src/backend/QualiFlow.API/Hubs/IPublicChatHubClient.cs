// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.ChatWidgets.DTOs;

namespace QualiFlow.API.Hubs;

/// <summary>
/// Strongly-typed client interface for PublicChatHub.
/// </summary>
public interface IPublicChatHubClient
{
    /// <summary>
    /// Receives a new message.
    /// </summary>
    /// <param name="message">The message DTO.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReceiveMessage(ChatMessageDto message);

    /// <summary>
    /// Receives typing indicator.
    /// </summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="isTyping">Whether someone is typing.</param>
    /// <returns>A task representing the async operation.</returns>
    Task TypingIndicator(Guid sessionId, bool isTyping);

    /// <summary>
    /// Notifies that the session has ended.
    /// </summary>
    /// <param name="sessionId">The session ID.</param>
    /// <param name="reason">Optional reason.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SessionEnded(Guid sessionId, string? reason);

    /// <summary>
    /// Receives an AI response message.
    /// </summary>
    /// <param name="message">The AI message DTO.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReceiveAIResponse(ChatMessageDto message);

    /// <summary>
    /// Receives a streaming AI response token.
    /// </summary>
    /// <param name="messageId">The message ID being streamed.</param>
    /// <param name="token">The token chunk.</param>
    /// <param name="isComplete">Whether this is the final token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReceiveAIStreamToken(Guid messageId, string token, bool isComplete);
}

