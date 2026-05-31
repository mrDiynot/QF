using QualiFlow.Application.Features.Messages.DTOs;

namespace QualiFlow.Application.Features.Messages.Services;

/// <summary>
/// Service interface for message operations.
/// Provides business logic for managing messages with multi-tenancy support.
/// </summary>
public interface IMessageService
{
    /// <summary>
    /// Gets a paginated list of messages for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">Optional conversation ID filter.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated response containing messages.</returns>
    Task<PagedMessageResponse> GetMessagesAsync(
        Guid businessId,
        Guid? conversationId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a message by ID.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The message if found; otherwise, null.</returns>
    Task<MessageResponse?> GetMessageByIdAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new message.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="request">The message creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created message.</returns>
    Task<MessageResponse> CreateMessageAsync(
        Guid businessId,
        CreateMessageRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing message.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID to update.</param>
    /// <param name="request">The message update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated message if found; otherwise, null.</returns>
    Task<MessageResponse?> UpdateMessageAsync(
        Guid businessId,
        Guid messageId,
        UpdateMessageRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a message (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="messageId">The message ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the message was deleted; otherwise, false.</returns>
    Task<bool> DeleteMessageAsync(
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
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated response containing matching messages.</returns>
    Task<PagedMessageResponse> SearchMessagesAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);
}

