using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Conversation entity operations.
/// Enforces multi-tenancy by filtering all queries by BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class ConversationRepository(
    QualiFlowDbContext context,
    ILogger<ConversationRepository> logger) : IConversationRepository
{
    /// <inheritdoc />
    public Task<Conversation?> GetByIdAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversation(logger, conversationId, businessId);

        return context.Conversations
            .AsNoTracking()
            .Include(c => c.Lead)
            .Include(c => c.Messages)
            .Where(c => c.BusinessId == businessId && c.Id == conversationId && c.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Conversation>> GetAllAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversations(logger, businessId, leadId, status, channel, skip, take);

        // Sprint 19: Performance optimization - Don't load all messages, use AsSplitQuery for better performance
        var query = context.Conversations
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null);

        if (leadId.HasValue)
        {
            query = query.Where(c => c.LeadId == leadId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrEmpty(channel))
        {
            query = query.Where(c => c.Channel == channel);
        }

        return await query
            .OrderByDescending(c => c.StartedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversationCount(logger, businessId, leadId, status, channel);

        var query = context.Conversations
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null);

        if (leadId.HasValue)
        {
            query = query.Where(c => c.LeadId == leadId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrEmpty(channel))
        {
            query = query.Where(c => c.Channel == channel);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Conversation> AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        LogAddingConversation(logger, conversation.LeadId, conversation.Channel, conversation.BusinessId);

        await context.Conversations.AddAsync(conversation, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return conversation;
    }

    /// <inheritdoc />
    public Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        LogUpdatingConversation(logger, conversation.Id, conversation.BusinessId);

        conversation.UpdatedAt = DateTime.UtcNow;
        context.Conversations.Update(conversation);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingConversation(logger, conversationId, businessId);

        var conversation = await context.Conversations
            .Where(c => c.BusinessId == businessId && c.Id == conversationId && c.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (conversation == null)
        {
            LogConversationNotFound(logger, conversationId, businessId);
            return false;
        }

        conversation.DeletedAt = DateTime.UtcNow;
        context.Conversations.Update(conversation);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public async Task<ConversationListResponse> GetConversationListAsync(
        Guid businessId,
        Guid userId,
        string? searchTerm,
        ConversationStatus? status,
        string? channel,
        DateTime? dateFrom,
        DateTime? dateTo,
        ConversationSortField sortBy,
        SortDirection sortDirection,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversationList(logger, businessId, userId, searchTerm, status, channel);

        var query = BuildConversationQuery(businessId, searchTerm, status, channel, dateFrom, dateTo);
        var totalCount = await query.CountAsync(cancellationToken);
        var totalActive = await query.Where(c => c.Status == ConversationStatus.Open).CountAsync(cancellationToken);
        var totalClosed = await query.Where(c => c.Status == ConversationStatus.Closed).CountAsync(cancellationToken);

        query = ApplySorting(query, sortBy, sortDirection);
        var conversations = await ExecutePaginatedQueryAsync(query, page, pageSize, cancellationToken);

        var conversationIds = conversations.Select(c => c.Id).ToList();
        var unreadCounts = await GetUnreadCountsAsync(conversationIds, userId, cancellationToken);
        var items = conversations.Select(c => MapToListItem(c, unreadCounts)).ToList();
        var totalUnreadCount = await GetTotalUnreadCountAsync(businessId, userId, cancellationToken);

        return new ConversationListResponse
        {
            Items = items,
            TotalCount = totalCount,
            TotalActive = totalActive,
            TotalClosed = totalClosed,
            Page = page,
            PageSize = pageSize,
            TotalUnreadCount = totalUnreadCount,
        };
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversation {ConversationId} for business {BusinessId}")]
    private static partial void LogGettingConversation(ILogger logger, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversations for business {BusinessId} with leadId {LeadId}, status {Status}, channel {Channel}, skip {Skip}, take {Take}")]
    private static partial void LogGettingConversations(ILogger logger, Guid businessId, Guid? leadId, ConversationStatus? status, string? channel, int skip, int take);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversation count for business {BusinessId} with leadId {LeadId}, status {Status}, channel {Channel}")]
    private static partial void LogGettingConversationCount(ILogger logger, Guid businessId, Guid? leadId, ConversationStatus? status, string? channel);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding new conversation for lead {LeadId} on channel {Channel} for business {BusinessId}")]
    private static partial void LogAddingConversation(ILogger logger, Guid leadId, string channel, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating conversation {ConversationId} for business {BusinessId}")]
    private static partial void LogUpdatingConversation(ILogger logger, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleting conversation {ConversationId} for business {BusinessId}")]
    private static partial void LogDeletingConversation(ILogger logger, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Conversation {ConversationId} not found for business {BusinessId}")]
    private static partial void LogConversationNotFound(ILogger logger, Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversation list for business {BusinessId}, user {UserId}, search {SearchTerm}, status {Status}, channel {Channel}")]
    private static partial void LogGettingConversationList(ILogger logger, Guid businessId, Guid userId, string? searchTerm, ConversationStatus? status, string? channel);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting open conversation for lead {LeadId} on channel {Channel} for business {BusinessId}")]
    private static partial void LogGettingOpenConversation(ILogger logger, Guid leadId, string channel, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting recent conversations with messages for business {BusinessId} since {Since}, limit {Limit}")]
    private static partial void LogGettingRecentConversations(ILogger logger, Guid businessId, DateTime since, int limit);

    /// <inheritdoc />
    public Task<Conversation?> GetOpenConversationAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        CancellationToken cancellationToken = default)
    {
        LogGettingOpenConversation(logger, leadId, channel, businessId);

        return context.Conversations
            .AsNoTracking()
            .Where(c => c.BusinessId == businessId &&
                        c.LeadId == leadId &&
                        c.Channel == channel &&
                        c.Status == ConversationStatus.Open &&
                        c.DeletedAt == null)
            .OrderByDescending(c => c.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Conversation>> GetRecentWithMessagesAsync(
        Guid businessId,
        DateTime since,
        int limit = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingRecentConversations(logger, businessId, since, limit);

        return await context.Conversations
            .AsNoTracking()
            .AsSplitQuery()
            .Include(c => c.Messages.OrderBy(m => m.SentAt).Take(20))
            .Where(c => c.BusinessId == businessId &&
                        c.DeletedAt == null &&
                        c.CreatedAt >= since &&
                        !c.IsSimulated)
            .OrderByDescending(c => c.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    private static IQueryable<Conversation> ApplySorting(
        IQueryable<Conversation> query,
        ConversationSortField sortBy,
        SortDirection sortDirection)
    {
        return (sortBy, sortDirection) switch
        {
            (ConversationSortField.CreatedAt, SortDirection.Ascending) => query.OrderBy(c => c.CreatedAt),
            (ConversationSortField.CreatedAt, SortDirection.Descending) => query.OrderByDescending(c => c.CreatedAt),
            (ConversationSortField.LastMessageAt, SortDirection.Ascending) =>
                query.OrderBy(c => c.Messages.Max(m => m.SentAt)),
            (ConversationSortField.LastMessageAt, SortDirection.Descending) =>
                query.OrderByDescending(c => c.Messages.Max(m => m.SentAt)),
            _ => query.OrderByDescending(c => c.Messages.Max(m => m.SentAt)),
        };
    }

    private static Task<List<Conversation>> ExecutePaginatedQueryAsync(
        IQueryable<Conversation> query,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var skip = (page - 1) * pageSize;
        return query.Skip(skip).Take(pageSize).ToListAsync(cancellationToken);
    }

    private static ConversationListItemResponse MapToListItem(
        Conversation conversation,
        Dictionary<Guid, int> unreadCounts)
    {
        var lastMessage = conversation.Messages
            .Where(m => m.DeletedAt == null)
            .OrderByDescending(m => m.SentAt)
            .FirstOrDefault();

        var leadSummary = MapLeadSummary(conversation.Lead);
        var lastMessagePreview = MapLastMessagePreview(lastMessage);

        return new ConversationListItemResponse
        {
            Id = conversation.Id,
            LeadId = conversation.LeadId,
            Lead = leadSummary,
            Channel = conversation.Channel,
            Status = conversation.Status,
            LastMessage = lastMessagePreview,
            UnreadCount = unreadCounts.GetValueOrDefault(conversation.Id, 0),
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = lastMessage?.SentAt,
        };
    }

    private static LeadSummaryDto? MapLeadSummary(Lead? lead)
    {
        if (lead == null)
        {
            return null;
        }

        return new LeadSummaryDto
        {
            Name = lead.Name,
            Email = lead.Email,
            Status = lead.Status.ToString(),
            Score = lead.Score,
        };
    }

    private static LastMessagePreviewDto? MapLastMessagePreview(Message? message)
    {
        if (message == null)
        {
            return null;
        }

        var content = message.Content.Length > 100
            ? message.Content[..100] + "..."
            : message.Content;

        return new LastMessagePreviewDto
        {
            Content = content,
            Direction = message.Direction.ToString(),
            SentAt = message.SentAt,
        };
    }

    private IQueryable<Conversation> BuildConversationQuery(
        Guid businessId,
        string? searchTerm,
        ConversationStatus? status,
        string? channel,
        DateTime? dateFrom,
        DateTime? dateTo)
    {
        var query = context.Conversations
            .AsNoTracking()
            .Include(c => c.Lead)
            .Include(c => c.Messages)
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c =>
                EF.Functions.ILike(c.Lead.Name, $"%{searchTerm}%") ||
                EF.Functions.ILike(c.Lead.Email, $"%{searchTerm}%"));
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        if (!string.IsNullOrEmpty(channel))
        {
            query = query.Where(c => c.Channel == channel);
        }

        if (dateFrom.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= dateTo.Value);
        }

        return query;
    }

    private Task<Dictionary<Guid, int>> GetUnreadCountsAsync(
        List<Guid> conversationIds,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return context.Messages
            .Where(m => conversationIds.Contains(m.ConversationId) &&
                       m.DeletedAt == null &&
                       !context.MessageReadStatuses.Any(rs => rs.MessageId == m.Id && rs.UserId == userId))
            .GroupBy(m => m.ConversationId)
            .Select(g => new { ConversationId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ConversationId, x => x.Count, cancellationToken);
    }

    private Task<int> GetTotalUnreadCountAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return context.Messages
            .Where(m => m.Conversation.BusinessId == businessId &&
                       m.Conversation.DeletedAt == null &&
                       m.DeletedAt == null &&
                       !context.MessageReadStatuses.Any(rs => rs.MessageId == m.Id && rs.UserId == userId))
            .CountAsync(cancellationToken);
    }
}

