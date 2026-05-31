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
/// Repository implementation for ChatSession entity operations.
/// </summary>
public partial class ChatSessionRepository(
    QualiFlowDbContext context,
    ILogger<ChatSessionRepository> logger) : IChatSessionRepository
{
    /// <inheritdoc />
    public Task<ChatSession?> GetByIdAsync(
        Guid businessId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        LogGettingSession(logger, sessionId, businessId);

        return context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId && s.Id == sessionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<ChatSession?> GetBySessionTokenAsync(
        string sessionToken,
        CancellationToken cancellationToken = default)
    {
        LogGettingSessionByToken(logger, sessionToken);

        return context.ChatSessions
            .AsNoTracking()
            .Where(s => s.SessionToken == sessionToken)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSession>> GetAllAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingSessions(logger, businessId, widgetId, status, skip, take);

        var query = context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId);

        if (widgetId.HasValue)
        {
            query = query.Where(s => s.ChatWidgetId == widgetId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return await query
            .OrderByDescending(s => s.LastActivityAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSession>> GetActiveSessionsAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default)
    {
        return await context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId &&
                       s.ChatWidgetId == widgetId &&
                       s.Status == ChatSessionStatus.Active)
            .OrderByDescending(s => s.LastActivityAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSession>> GetWaitingForAgentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId &&
                       s.Status == ChatSessionStatus.WaitingForAgent)
            .OrderBy(s => s.LastActivityAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSession>> GetByAgentAsync(
        Guid businessId,
        string agentId,
        ChatSessionStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId &&
                       s.AssignedAgentId == agentId);

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return await query
            .OrderByDescending(s => s.LastActivityAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.ChatSessions
            .Where(s => s.BusinessId == businessId);

        if (widgetId.HasValue)
        {
            query = query.Where(s => s.ChatWidgetId == widgetId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ChatSession> AddAsync(
        ChatSession session,
        CancellationToken cancellationToken = default)
    {
        LogAddingSession(logger, session.SessionToken, session.BusinessId);

        context.ChatSessions.Add(session);
        await context.SaveChangesAsync(cancellationToken);

        return session;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(
        ChatSession session,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingSession(logger, session.Id, session.BusinessId);

        session.UpdatedAt = DateTime.UtcNow;
        context.ChatSessions.Update(session);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSession>> GetTimedOutSessionsAsync(
        int timeoutMinutes,
        CancellationToken cancellationToken = default)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-timeoutMinutes);

        return await context.ChatSessions
            .Where(s => s.Status == ChatSessionStatus.Active &&
                       s.LastActivityAt < cutoff)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<ChatSession?> GetWithMessagesAsync(
        Guid businessId,
        Guid sessionId,
        int messageLimit = 100,
        CancellationToken cancellationToken = default)
    {
        return context.ChatSessions
            .AsNoTracking()
            .Include(s => s.Messages.OrderByDescending(m => m.SentAt).Take(messageLimit))
            .Where(s => s.BusinessId == businessId && s.Id == sessionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ChatSessionSummaryProjection>> GetSessionSummariesAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingSessions(logger, businessId, widgetId, status, skip, take);

        var query = context.ChatSessions
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId);

        if (widgetId.HasValue)
        {
            query = query.Where(s => s.ChatWidgetId == widgetId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        return await query
            .OrderByDescending(s => s.LastActivityAt)
            .Skip(skip)
            .Take(take)
            .Select(s => new ChatSessionSummaryProjection
            {
                Id = s.Id,
                VisitorName = s.VisitorName,
                VisitorEmail = s.VisitorEmail,
                Status = s.Status,
                LastMessage = s.Messages
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => m.Content)
                    .FirstOrDefault(),
                LastActivityAt = s.LastActivityAt,
                UnreadCount = s.Messages
                    .Count(m => m.Type == ChatMessageType.Visitor && !m.IsRead),
                AIQualificationScore = s.AIQualificationScore,
            })
            .ToListAsync(cancellationToken);
    }
}

