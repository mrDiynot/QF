// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for ChatSession entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IChatSessionRepository
{
    /// <summary>
    /// Gets a chat session by ID within the specified business context.
    /// </summary>
    /// <returns>The chat session if found; otherwise, null.</returns>
    Task<ChatSession?> GetByIdAsync(Guid businessId, Guid sessionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a chat session by session token (public access).
    /// </summary>
    /// <returns>The chat session if found; otherwise, null.</returns>
    Task<ChatSession?> GetBySessionTokenAsync(string sessionToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all chat sessions for a business with optional filtering.
    /// </summary>
    /// <returns>A list of chat sessions.</returns>
    Task<IReadOnlyList<ChatSession>> GetAllAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active sessions for a widget.
    /// </summary>
    /// <returns>A list of active chat sessions.</returns>
    Task<IReadOnlyList<ChatSession>> GetActiveSessionsAsync(
        Guid businessId,
        Guid widgetId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets sessions waiting for agent.
    /// </summary>
    /// <returns>A list of sessions waiting for agent.</returns>
    Task<IReadOnlyList<ChatSession>> GetWaitingForAgentAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets sessions assigned to a specific agent.
    /// </summary>
    /// <returns>A list of sessions assigned to the agent.</returns>
    Task<IReadOnlyList<ChatSession>> GetByAgentAsync(
        Guid businessId,
        string agentId,
        ChatSessionStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of chat sessions for a business.
    /// </summary>
    /// <returns>The count of chat sessions.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new chat session to the database.
    /// </summary>
    /// <returns>The added chat session.</returns>
    Task<ChatSession> AddAsync(ChatSession session, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing chat session.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(ChatSession session, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets timed out sessions that need to be closed.
    /// </summary>
    /// <returns>A list of timed out sessions.</returns>
    Task<IReadOnlyList<ChatSession>> GetTimedOutSessionsAsync(
        int timeoutMinutes,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets session with messages.
    /// </summary>
    /// <returns>The chat session with messages if found; otherwise, null.</returns>
    Task<ChatSession?> GetWithMessagesAsync(
        Guid businessId,
        Guid sessionId,
        int messageLimit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets chat sessions with summary data (last message, unread count) in a single query.
    /// PERFORMANCE: Avoids N+1 queries by using projection.
    /// </summary>
    /// <returns>A list of session summaries with last message and unread count.</returns>
    Task<IReadOnlyList<ChatSessionSummaryProjection>> GetSessionSummariesAsync(
        Guid businessId,
        Guid? widgetId = null,
        ChatSessionStatus? status = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Projection for chat session summary to avoid N+1 queries.
/// </summary>
public record ChatSessionSummaryProjection
{
    public Guid Id { get; init; }
    public string? VisitorName { get; init; }
    public string? VisitorEmail { get; init; }
    public ChatSessionStatus Status { get; init; }
    public string? LastMessage { get; init; }
    public DateTime LastActivityAt { get; init; }
    public int UnreadCount { get; init; }
    public int? AIQualificationScore { get; init; }
}

