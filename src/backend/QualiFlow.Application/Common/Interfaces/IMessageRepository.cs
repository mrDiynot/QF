using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Message entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IMessageRepository
{
    /// <summary>
    /// Gets a message by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The message if found; otherwise, null.</returns>
    Task<Message?> GetByIdAsync(Guid businessId, Guid messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all messages for a business with optional filtering and pagination.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">Optional conversation ID filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of messages.</returns>
    Task<IReadOnlyList<Message>> GetAllAsync(
        Guid businessId,
        Guid? conversationId = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of messages for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">Optional conversation ID filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of messages.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new message to the database.
    /// </summary>
    /// <param name="message">The message to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added message with generated ID.</returns>
    Task<Message> AddAsync(Message message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing message in the database.
    /// </summary>
    /// <param name="message">The message to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Message message, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a message from the database (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the message was deleted; otherwise, false.</returns>
    Task<bool> DeleteAsync(Guid businessId, Guid messageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a message thread (parent message and all its replies) by message ID.
    /// Returns the entire thread including the root message and all nested replies.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID (can be root or any reply in the thread).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of messages in the thread, ordered by SentAt.</returns>
    Task<IReadOnlyList<Message>> GetThreadAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a message as read by a specific user.
    /// Creates a MessageReadStatus record if it doesn't already exist.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID to mark as read.</param>
    /// <param name="userId">The user ID who read the message.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the message was marked as read; otherwise, false.</returns>
    Task<bool> MarkAsReadAsync(
        Guid businessId,
        Guid messageId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of unread messages in a conversation for a specific user.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The count of unread messages.</returns>
    Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches messages by content using full-text search.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="searchTerm">The search term to look for in message content.</param>
    /// <param name="conversationId">Optional conversation ID filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of messages matching the search term.</returns>
    Task<IReadOnlyList<Message>> SearchAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the count of messages matching a search term.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="searchTerm">The search term to look for in message content.</param>
    /// <param name="conversationId">Optional conversation ID filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The count of matching messages.</returns>
    Task<int> GetSearchCountAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        CancellationToken cancellationToken = default);
}

