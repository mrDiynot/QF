using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.Services;

/// <summary>
/// Service interface for conversation operations.
/// Provides business logic for managing conversations with multi-tenancy support.
/// </summary>
public interface IConversationService
{
    /// <summary>
    /// Gets a paginated list of conversations for a business with optional filtering.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="leadId">Optional lead ID filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="channel">Optional channel filter.</param>
    /// <param name="page">The page number (1-based).</param>
    /// <param name="pageSize">The number of items per page.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated response containing conversations.</returns>
    Task<PagedConversationResponse> GetConversationsAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a conversation by ID.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation if found; otherwise, null.</returns>
    Task<ConversationResponse?> GetConversationByIdAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new conversation.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="request">The conversation creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created conversation.</returns>
    Task<ConversationResponse> CreateConversationAsync(
        Guid businessId,
        CreateConversationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing conversation.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID to update.</param>
    /// <param name="request">The conversation update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation if found; otherwise, null.</returns>
    Task<ConversationResponse?> UpdateConversationAsync(
        Guid businessId,
        Guid conversationId,
        UpdateConversationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a conversation (soft delete).
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the conversation was deleted; otherwise, false.</returns>
    Task<bool> DeleteConversationAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an enhanced conversation list with last message, unread counts, and lead summary.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="userId">The user ID for unread count calculation.</param>
    /// <param name="request">The list request with filters and sorting.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enhanced conversation list with metadata.</returns>
    Task<ConversationListResponse> GetConversationListAsync(
        Guid businessId,
        Guid userId,
        ConversationListRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the tags for a specific conversation.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation tags if found; otherwise, null.</returns>
    Task<ConversationTagsResponse?> GetConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds tags to a conversation.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="tags">The tags to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation tags if found; otherwise, null.</returns>
    Task<ConversationTagsResponse?> AddConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        IReadOnlyList<string> tags,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes tags from a conversation.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="tags">The tags to remove.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation tags if found; otherwise, null.</returns>
    Task<ConversationTagsResponse?> RemoveConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        IReadOnlyList<string> tags,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets tag suggestions based on existing tags in the business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="query">Optional search query to filter suggestions.</param>
    /// <param name="limit">Maximum number of suggestions to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tag suggestions with usage counts.</returns>
    Task<IReadOnlyList<TagSuggestionDto>> GetTagSuggestionsAsync(
        Guid businessId,
        string? query = null,
        int limit = 20,
        CancellationToken cancellationToken = default);
}

