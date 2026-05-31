using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Conversation entity operations.
/// All operations are scoped to a specific business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IConversationRepository
{
    /// <summary>
    /// Gets a conversation by ID within the specified business context.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation if found; otherwise, null.</returns>
    Task<Conversation?> GetByIdAsync(Guid businessId, Guid conversationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all conversations for a business with optional filtering and pagination.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">Optional lead ID filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="channel">Optional channel filter.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of conversations.</returns>
    Task<IReadOnlyList<Conversation>> GetAllAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of conversations for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">Optional lead ID filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="channel">Optional channel filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of conversations.</returns>
    Task<int> GetCountAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new conversation to the database.
    /// </summary>
    /// <param name="conversation">The conversation to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added conversation with generated ID.</returns>
    Task<Conversation> AddAsync(Conversation conversation, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing conversation in the database.
    /// </summary>
    /// <param name="conversation">The conversation to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Conversation conversation, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a conversation from the database (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the conversation was deleted; otherwise, false.</returns>
    Task<bool> DeleteAsync(Guid businessId, Guid conversationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an enhanced conversation list with last message, unread counts, and lead summary.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="userId">The user ID for unread count calculation.</param>
    /// <param name="searchTerm">Optional search term for lead name or email.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="channel">Optional channel filter.</param>
    /// <param name="dateFrom">Optional start date filter.</param>
    /// <param name="dateTo">Optional end date filter.</param>
    /// <param name="sortBy">Sort field.</param>
    /// <param name="sortDirection">Sort direction.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Page size.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enhanced conversation list with metadata.</returns>
    Task<ConversationListResponse> GetConversationListAsync(
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
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an open conversation for a lead and channel.
    /// Used for inbound message processing to find or create conversations.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="channel">The channel type (SMS, Voice, WhatsApp, etc.).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The open conversation if found; otherwise, null.</returns>
    Task<Conversation?> GetOpenConversationAsync(
        Guid businessId,
        Guid leadId,
        string channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent conversations with their messages for AI analysis.
    /// Used for FAQ extraction and conversation analysis.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="since">Only include conversations since this date.</param>
    /// <param name="limit">Maximum number of conversations to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of conversations with their messages.</returns>
    Task<IReadOnlyList<Conversation>> GetRecentWithMessagesAsync(
        Guid businessId,
        DateTime since,
        int limit = 50,
        CancellationToken cancellationToken = default);
}

