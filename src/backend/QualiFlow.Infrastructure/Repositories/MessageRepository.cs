using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Message entity operations.
/// Enforces multi-tenancy by filtering all queries through Conversation.BusinessId.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger instance.</param>
public partial class MessageRepository(
    QualiFlowDbContext context,
    ILogger<MessageRepository> logger) : IMessageRepository
{
    /// <inheritdoc />
    public Task<Message?> GetByIdAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessage(logger, messageId, businessId);

        return context.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId && m.Id == messageId && m.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Message>> GetAllAsync(
        Guid businessId,
        Guid? conversationId = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessages(logger, businessId, conversationId, skip, take);

        var query = context.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId && m.DeletedAt == null);

        if (conversationId.HasValue)
        {
            query = query.Where(m => m.ConversationId == conversationId.Value);
        }

        return await query
            .OrderByDescending(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetCountAsync(
        Guid businessId,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessageCount(logger, businessId, conversationId);

        var query = context.Messages
            .Where(m => m.Conversation.BusinessId == businessId && m.DeletedAt == null);

        if (conversationId.HasValue)
        {
            query = query.Where(m => m.ConversationId == conversationId.Value);
        }

        return query.CountAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<Message> AddAsync(Message message, CancellationToken cancellationToken = default)
    {
        LogAddingMessage(logger, message.ConversationId, message.Direction);

        await context.Messages.AddAsync(message, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return message;
    }

    /// <inheritdoc />
    public Task UpdateAsync(Message message, CancellationToken cancellationToken = default)
    {
        LogUpdatingMessage(logger, message.Id);

        message.UpdatedAt = DateTime.UtcNow;
        context.Messages.Update(message);
        return context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingMessage(logger, messageId, businessId);

        var message = await context.Messages
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId && m.Id == messageId && m.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (message == null)
        {
            LogMessageNotFound(logger, messageId, businessId);
            return false;
        }

        message.DeletedAt = DateTime.UtcNow;
        context.Messages.Update(message);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Message>> GetThreadAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogGettingThread(logger, messageId, businessId);

        // First, get the message to determine if it's a root or reply
        var message = await context.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId && m.Id == messageId && m.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (message == null)
        {
            LogMessageNotFound(logger, messageId, businessId);
            return Array.Empty<Message>();
        }

        // Find the root message ID (either this message or its parent)
        var rootMessageId = message.ParentMessageId ?? message.Id;

        // Get all messages in the thread (root + all replies)
        var threadMessages = await context.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId &&
                       m.DeletedAt == null &&
                       (m.Id == rootMessageId || m.ParentMessageId == rootMessageId))
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);

        return threadMessages;
    }

    /// <inheritdoc />
    public async Task<bool> MarkAsReadAsync(
        Guid businessId,
        Guid messageId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        LogMarkingMessageAsRead(logger, messageId, userId, businessId);

        // First, verify the message exists and belongs to the business
        var message = await context.Messages
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId && m.Id == messageId && m.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (message == null)
        {
            LogMessageNotFound(logger, messageId, businessId);
            return false;
        }

        // Check if already marked as read by this user
        var existingReadStatus = await context.MessageReadStatuses
            .Where(mrs => mrs.MessageId == messageId && mrs.UserId == userId && mrs.DeletedAt == null)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingReadStatus != null)
        {
            LogMessageAlreadyRead(logger, messageId, userId);
            return true; // Already marked as read
        }

        // Create new read status
        var readStatus = new MessageReadStatus
        {
            MessageId = messageId,
            UserId = userId,
            ReadAt = DateTime.UtcNow,
        };

        await context.MessageReadStatuses.AddAsync(readStatus, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc />
    public async Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        LogGettingUnreadCount(logger, conversationId, userId, businessId);

        var unreadCount = await context.Messages
            .Where(m => m.Conversation.BusinessId == businessId &&
                       m.ConversationId == conversationId &&
                       m.DeletedAt == null &&
                       !m.ReadStatuses.Any(rs => rs.UserId == userId && rs.DeletedAt == null))
            .CountAsync(cancellationToken);

        return unreadCount;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Message>> SearchAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        LogSearchingMessages(logger, businessId, searchTerm, conversationId);

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return Array.Empty<Message>();
        }

        var normalizedSearchTerm = searchTerm.Trim();

        // Use PostgreSQL full-text search with tsvector for better performance (S14-BE-002)
        var query = context.Messages
            .AsNoTracking()
            .Include(m => m.Conversation)
            .Where(m => m.Conversation.BusinessId == businessId &&
                       m.DeletedAt == null &&
                       EF.Functions.ToTsVector("english", m.Content)
                           .Matches(EF.Functions.ToTsQuery("english", normalizedSearchTerm)));

        if (conversationId.HasValue)
        {
            query = query.Where(m => m.ConversationId == conversationId.Value);
        }

        return await query
            .OrderByDescending(m => m.SentAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<int> GetSearchCountAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default)
    {
        LogGettingSearchCount(logger, businessId, searchTerm, conversationId);

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return 0;
        }

        var normalizedSearchTerm = searchTerm.Trim();

        // Use PostgreSQL full-text search with tsvector for better performance (S14-BE-002)
        var query = context.Messages
            .Where(m => m.Conversation.BusinessId == businessId &&
                       m.DeletedAt == null &&
                       EF.Functions.ToTsVector("english", m.Content)
                           .Matches(EF.Functions.ToTsQuery("english", normalizedSearchTerm)));

        if (conversationId.HasValue)
        {
            query = query.Where(m => m.ConversationId == conversationId.Value);
        }

        return await query.CountAsync(cancellationToken);
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting message {MessageId} for business {BusinessId}")]
    private static partial void LogGettingMessage(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting messages for business {BusinessId} with conversationId {ConversationId}, skip {Skip}, take {Take}")]
    private static partial void LogGettingMessages(ILogger logger, Guid businessId, Guid? conversationId, int skip, int take);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting message count for business {BusinessId} with conversationId {ConversationId}")]
    private static partial void LogGettingMessageCount(ILogger logger, Guid businessId, Guid? conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Adding new message for conversation {ConversationId} with direction {Direction}")]
    private static partial void LogAddingMessage(ILogger logger, Guid conversationId, QualiFlow.Domain.Enums.MessageDirection direction);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating message {MessageId}")]
    private static partial void LogUpdatingMessage(ILogger logger, Guid messageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Soft deleting message {MessageId} for business {BusinessId}")]
    private static partial void LogDeletingMessage(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Message {MessageId} not found for business {BusinessId}")]
    private static partial void LogMessageNotFound(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting thread for message {MessageId} in business {BusinessId}")]
    private static partial void LogGettingThread(ILogger logger, Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Marking message {MessageId} as read by user {UserId} for business {BusinessId}")]
    private static partial void LogMarkingMessageAsRead(ILogger logger, Guid messageId, Guid userId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Message {MessageId} already marked as read by user {UserId}")]
    private static partial void LogMessageAlreadyRead(ILogger logger, Guid messageId, Guid userId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting unread count for conversation {ConversationId} and user {UserId} in business {BusinessId}")]
    private static partial void LogGettingUnreadCount(ILogger logger, Guid conversationId, Guid userId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Searching messages for business {BusinessId} with term '{SearchTerm}' in conversation {ConversationId}")]
    private static partial void LogSearchingMessages(ILogger logger, Guid businessId, string searchTerm, Guid? conversationId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting search count for business {BusinessId} with term '{SearchTerm}' in conversation {ConversationId}")]
    private static partial void LogGettingSearchCount(ILogger logger, Guid businessId, string searchTerm, Guid? conversationId);
}

