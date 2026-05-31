// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.ChatWidgets.DTOs;

namespace QualiFlow.Application.Features.ChatWidgets.Services;

/// <summary>
/// Service interface for chat session operations.
/// </summary>
public interface IChatSessionService
{
    /// <summary>
    /// Starts a new chat session.
    /// </summary>
    /// <returns>The session start response.</returns>
    Task<StartChatSessionResponse?> StartSessionAsync(
        StartChatSessionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a message in a chat session.
    /// </summary>
    /// <returns>The sent message DTO.</returns>
    Task<ChatMessageDto?> SendMessageAsync(
        SendChatMessageRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets messages for a session by token.
    /// </summary>
    /// <returns>A list of chat messages.</returns>
    Task<IReadOnlyList<ChatMessageDto>?> GetMessagesAsync(
        string sessionToken,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ends a chat session.
    /// </summary>
    /// <returns>True if ended; otherwise, false.</returns>
    Task<bool> EndSessionAsync(
        EndChatSessionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Transfers a session to a human agent.
    /// </summary>
    /// <returns>True if transferred; otherwise, false.</returns>
    Task<bool> TransferToAgentAsync(
        Guid businessId,
        TransferToAgentRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a session by ID.
    /// </summary>
    /// <returns>The chat session DTO, or null if not found.</returns>
    Task<ChatSessionDto?> GetSessionByIdAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a session by session token.
    /// </summary>
    /// <returns>The chat session DTO, or null if not found.</returns>
    Task<ChatSessionDto?> GetBySessionTokenAsync(
        string sessionToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all sessions for a business.
    /// </summary>
    /// <returns>A list of chat session summaries.</returns>
    Task<IReadOnlyList<ChatSessionSummaryDto>> GetSessionsAsync(
        Guid businessId,
        Guid? widgetId = null,
        string? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets sessions waiting for agent assignment.
    /// </summary>
    /// <returns>A list of sessions waiting for agent.</returns>
    Task<IReadOnlyList<ChatSessionSummaryDto>> GetWaitingForAgentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks messages as read.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task MarkMessagesAsReadAsync(
        Guid businessId,
        Guid sessionId,
        string readerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes AI response for a message.
    /// </summary>
    /// <returns>The AI response message, or null if AI is disabled.</returns>
    Task<ChatMessageDto?> ProcessAIResponseAsync(
        Guid sessionId,
        string userMessage,
        CancellationToken cancellationToken = default);
}

