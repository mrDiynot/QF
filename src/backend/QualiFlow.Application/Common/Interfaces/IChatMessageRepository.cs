// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for ChatMessage entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IChatMessageRepository
{
    /// <summary>
    /// Gets a chat message by ID within the specified business context.
    /// </summary>
    /// <returns>The chat message if found; otherwise, null.</returns>
    Task<ChatMessage?> GetByIdAsync(Guid businessId, Guid messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all messages for a chat session.
    /// </summary>
    /// <returns>A list of chat messages.</returns>
    Task<IReadOnlyList<ChatMessage>> GetBySessionIdAsync(
        Guid businessId,
        Guid sessionId,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets messages for a session by session token (public access).
    /// </summary>
    /// <returns>A list of chat messages.</returns>
    Task<IReadOnlyList<ChatMessage>> GetBySessionTokenAsync(
        string sessionToken,
        DateTime? since = null,
        int take = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of messages for a session.
    /// </summary>
    /// <returns>The count of messages.</returns>
    Task<int> GetCountBySessionIdAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread message count for a session.
    /// </summary>
    /// <returns>The count of unread messages.</returns>
    Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid sessionId,
        ChatMessageType? excludeType = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new chat message to the database.
    /// </summary>
    /// <returns>The added chat message.</returns>
    Task<ChatMessage> AddAsync(ChatMessage message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks messages as read.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task MarkAsReadAsync(
        Guid businessId,
        Guid sessionId,
        string readerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the last message for a session.
    /// </summary>
    /// <returns>The last chat message if found; otherwise, null.</returns>
    Task<ChatMessage?> GetLastMessageAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default);
}

