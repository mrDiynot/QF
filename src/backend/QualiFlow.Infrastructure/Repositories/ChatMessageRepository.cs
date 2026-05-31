// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ChatMessage entity operations.
/// </summary>
public partial class ChatMessageRepository(
    QualiFlowDbContext context,
    ILogger<ChatMessageRepository> logger) : IChatMessageRepository
{
    /// <inheritdoc />
    public Task<ChatMessage?> GetByIdAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessage(logger, messageId, businessId);

        return context.ChatMessages
            .AsNoTracking()
            .Where(m => m.BusinessId == businessId && m.Id == messageId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatMessage>> GetBySessionIdAsync(
        Guid businessId,
        Guid sessionId,
        int skip = 0,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessages(logger, sessionId, businessId, skip, take);

        return await context.ChatMessages
            .AsNoTracking()
            .Where(m => m.BusinessId == businessId && m.ChatSessionId == sessionId)
            .OrderBy(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatMessage>> GetBySessionTokenAsync(
        string sessionToken,
        DateTime? since = null,
        int take = 100,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessagesByToken(logger, sessionToken, since);

        var query = context.ChatMessages
            .AsNoTracking()
            .Where(m => m.ChatSession.SessionToken == sessionToken);

        if (since.HasValue)
        {
            query = query.Where(m => m.SentAt > since.Value);
        }

        return await query
            .OrderBy(m => m.SentAt)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountBySessionIdAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        return context.ChatMessages
            .Where(m => m.BusinessId == businessId && m.ChatSessionId == sessionId)
            .CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid sessionId,
        ChatMessageType? excludeType = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.ChatMessages
            .Where(m => m.BusinessId == businessId &&
                       m.ChatSessionId == sessionId &&
                       !m.IsRead);

        if (excludeType.HasValue)
        {
            query = query.Where(m => m.Type != excludeType.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChatMessage> AddAsync(
        ChatMessage message,
        CancellationToken cancellationToken = default)
    {
        LogAddingMessage(logger, message.ChatSessionId, message.Type.ToString());

        context.ChatMessages.Add(message);
        await context.SaveChangesAsync(cancellationToken);

        return message;
    }

    /// <inheritdoc />
    public async Task MarkAsReadAsync(
        Guid businessId,
        Guid sessionId,
        string readerId,
        CancellationToken cancellationToken = default)
    {
        LogMarkingAsRead(logger, sessionId, readerId);

        var now = DateTime.UtcNow;

        await context.ChatMessages
            .Where(m => m.BusinessId == businessId &&
                       m.ChatSessionId == sessionId &&
                       m.SenderId != readerId &&
                       !m.IsRead)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(m => m.IsRead, true)
                    .SetProperty(m => m.ReadAt, now),
                cancellationToken);
    }

    /// <inheritdoc />
    public Task<ChatMessage?> GetLastMessageAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        return context.ChatMessages
            .AsNoTracking()
            .Where(m => m.BusinessId == businessId && m.ChatSessionId == sessionId)
            .OrderByDescending(m => m.SentAt)
            .FirstOrDefaultAsync(cancellationToken);
    }
}

