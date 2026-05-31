using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.Services;

/// <summary>
/// Service implementation for conversation operations.
/// </summary>
public partial class ConversationService : IConversationService
{
    private readonly IConversationRepository _conversationRepository;
    private readonly ILeadRepository _leadRepository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateConversationRequest> _createValidator;
    private readonly IValidator<UpdateConversationRequest> _updateValidator;
    private readonly ILogger<ConversationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationService"/> class.
    /// </summary>
    /// <param name="conversationRepository">The conversation repository.</param>
    /// <param name="leadRepository">The lead repository.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="createValidator">The create request validator.</param>
    /// <param name="updateValidator">The update request validator.</param>
    /// <param name="logger">The logger instance.</param>
    public ConversationService(
        IConversationRepository conversationRepository,
        ILeadRepository leadRepository,
        IMapper mapper,
        IValidator<CreateConversationRequest> createValidator,
        IValidator<UpdateConversationRequest> updateValidator,
        ILogger<ConversationService> logger)
    {
        _conversationRepository = conversationRepository;
        _leadRepository = leadRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedConversationResponse> GetConversationsAsync(
        Guid businessId,
        Guid? leadId = null,
        ConversationStatus? status = null,
        string? channel = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversations(businessId, leadId, status, channel, page, pageSize);

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 10;
        }

        var skip = (page - 1) * pageSize;
        var conversations = await _conversationRepository.GetAllAsync(
            businessId,
            leadId,
            status,
            channel,
            skip,
            pageSize,
            cancellationToken);

        var totalItems = await _conversationRepository.GetCountAsync(
            businessId,
            leadId,
            status,
            channel,
            cancellationToken);

        // Calculate aggregate stats (not filtered by current page)
        var totalActive = await _conversationRepository.GetCountAsync(
            businessId,
            leadId,
            ConversationStatus.Open,
            channel,
            cancellationToken);

        var totalInProgress = await _conversationRepository.GetCountAsync(
            businessId,
            leadId,
            ConversationStatus.InProgress,
            channel,
            cancellationToken);

        var totalClosed = await _conversationRepository.GetCountAsync(
            businessId,
            leadId,
            ConversationStatus.Closed,
            channel,
            cancellationToken);

        var totalArchived = await _conversationRepository.GetCountAsync(
            businessId,
            leadId,
            ConversationStatus.Archived,
            channel,
            cancellationToken);

        var conversationResponses = _mapper.Map<IReadOnlyList<ConversationResponse>>(conversations);

        // Calculate total unread count from conversation responses (which include unread counts)
        var totalUnreadCount = conversationResponses.Sum(c => c.UnreadCount);

        return new PagedConversationResponse
        {
            Items = conversationResponses,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            HasNextPage = page < (int)Math.Ceiling(totalItems / (double)pageSize),
            HasPreviousPage = page > 1,
            TotalActive = totalActive + totalInProgress,
            TotalClosed = totalClosed + totalArchived,
            TotalUnreadCount = totalUnreadCount,
        };
    }

    /// <inheritdoc />
    public async Task<ConversationResponse?> GetConversationByIdAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversation(conversationId, businessId);

        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);

        return conversation == null ? null : _mapper.Map<ConversationResponse>(conversation);
    }

    /// <inheritdoc />
    public async Task<ConversationResponse> CreateConversationAsync(
        Guid businessId,
        CreateConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingConversation(request.LeadId, request.Channel, businessId);

        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Verify lead exists (automatically filtered by current user's BusinessId)
        var leadExists = await _leadRepository.GetByIdAsync(request.LeadId, cancellationToken);
        if (leadExists == null)
        {
            LogLeadNotFound(request.LeadId, businessId);
            throw new ValidationException($"Lead with ID {request.LeadId} not found");
        }

        var conversation = _mapper.Map<Conversation>(request);
        conversation.BusinessId = businessId;
        conversation.CreatedAt = DateTime.UtcNow;

        var createdConversation = await _conversationRepository.AddAsync(conversation, cancellationToken);

        return _mapper.Map<ConversationResponse>(createdConversation);
    }

    /// <inheritdoc />
    public async Task<ConversationResponse?> UpdateConversationAsync(
        Guid businessId,
        Guid conversationId,
        UpdateConversationRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingConversation(conversationId, businessId);

        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            LogConversationNotFound(conversationId, businessId);
            return null;
        }

        ApplyConversationUpdates(conversation, request);

        await _conversationRepository.UpdateAsync(conversation, cancellationToken);

        return _mapper.Map<ConversationResponse>(conversation);
    }

    /// <inheritdoc />
    public Task<bool> DeleteConversationAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingConversation(conversationId, businessId);

        return _conversationRepository.DeleteAsync(businessId, conversationId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ConversationListResponse> GetConversationListAsync(
        Guid businessId,
        Guid userId,
        ConversationListRequest request,
        CancellationToken cancellationToken = default)
    {
        LogGettingConversationList(businessId, userId, request.SearchTerm, request.Status, request.Channel);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 || request.PageSize > 100 ? 10 : request.PageSize;

        var result = await _conversationRepository.GetConversationListAsync(
            businessId,
            userId,
            request.SearchTerm,
            request.Status,
            request.Channel,
            request.DateFrom,
            request.DateTo,
            request.SortBy,
            request.SortDirection,
            page,
            pageSize,
            cancellationToken);

        return result;
    }

    private static void ApplyConversationUpdates(Conversation conversation, UpdateConversationRequest request)
    {
        if (request.Status.HasValue)
        {
            conversation.Status = request.Status.Value;
        }

        if (request.EndedAt.HasValue)
        {
            conversation.EndedAt = request.EndedAt.Value;
        }

        conversation.UpdatedAt = DateTime.UtcNow;
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversations for business {BusinessId} with leadId {LeadId}, status {Status}, channel {Channel}, page {Page}, pageSize {PageSize}")]
    private partial void LogGettingConversations(Guid businessId, Guid? leadId, ConversationStatus? status, string? channel, int page, int pageSize);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversation {ConversationId} for business {BusinessId}")]
    private partial void LogGettingConversation(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating conversation for lead {LeadId} on channel {Channel} for business {BusinessId}")]
    private partial void LogCreatingConversation(Guid leadId, string channel, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Lead {LeadId} not found for business {BusinessId}")]
    private partial void LogLeadNotFound(Guid leadId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating conversation {ConversationId} for business {BusinessId}")]
    private partial void LogUpdatingConversation(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Conversation {ConversationId} not found for business {BusinessId}")]
    private partial void LogConversationNotFound(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting conversation {ConversationId} for business {BusinessId}")]
    private partial void LogDeletingConversation(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting conversation list for business {BusinessId}, user {UserId}, search {SearchTerm}, status {Status}, channel {Channel}")]
    private partial void LogGettingConversationList(Guid businessId, Guid userId, string? searchTerm, ConversationStatus? status, string? channel);

    /// <inheritdoc />
    public async Task<ConversationTagsResponse?> GetConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            return null;
        }

        return new ConversationTagsResponse
        {
            ConversationId = conversationId,
            Tags = ParseTags(conversation.Tags),
            UpdatedAt = conversation.UpdatedAt,
        };
    }

    /// <inheritdoc />
    public async Task<ConversationTagsResponse?> AddConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        IReadOnlyList<string> tags,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            return null;
        }

        var existingTags = ParseTags(conversation.Tags);
        var newTags = tags
            .Select(t => t.Trim().ToLowerInvariant())
            .Where(t => !string.IsNullOrEmpty(t) && !existingTags.Contains(t))
            .ToList();

        var allTags = existingTags.Concat(newTags).Distinct().ToList();
        conversation.Tags = string.Join(",", allTags);
        conversation.UpdatedAt = DateTime.UtcNow;

        await _conversationRepository.UpdateAsync(conversation, cancellationToken);

        LogTagsUpdated(conversationId, allTags.Count);

        return new ConversationTagsResponse
        {
            ConversationId = conversationId,
            Tags = allTags,
            UpdatedAt = conversation.UpdatedAt,
        };
    }

    /// <inheritdoc />
    public async Task<ConversationTagsResponse?> RemoveConversationTagsAsync(
        Guid businessId,
        Guid conversationId,
        IReadOnlyList<string> tags,
        CancellationToken cancellationToken = default)
    {
        var conversation = await _conversationRepository.GetByIdAsync(businessId, conversationId, cancellationToken);
        if (conversation == null)
        {
            return null;
        }

        var existingTags = ParseTags(conversation.Tags);
        var tagsToRemove = tags.Select(t => t.Trim().ToLowerInvariant()).ToHashSet();
        var remainingTags = existingTags.Where(t => !tagsToRemove.Contains(t)).ToList();

        conversation.Tags = remainingTags.Count > 0 ? string.Join(",", remainingTags) : null;
        conversation.UpdatedAt = DateTime.UtcNow;

        await _conversationRepository.UpdateAsync(conversation, cancellationToken);

        LogTagsUpdated(conversationId, remainingTags.Count);

        return new ConversationTagsResponse
        {
            ConversationId = conversationId,
            Tags = remainingTags,
            UpdatedAt = conversation.UpdatedAt,
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<TagSuggestionDto>> GetTagSuggestionsAsync(
        Guid businessId,
        string? query = null,
        int limit = 20,
        CancellationToken cancellationToken = default)
    {
        var conversations = await _conversationRepository.GetAllAsync(
            businessId,
            leadId: null,
            status: null,
            channel: null,
            skip: 0,
            take: 1000, // Get up to 1000 conversations for tag analysis
            cancellationToken: cancellationToken);

        // Extract all tags and count usage
        var tagCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var conversation in conversations)
        {
            var tags = ParseTags(conversation.Tags);
            foreach (var tag in tags)
            {
                tagCounts.TryGetValue(tag, out var count);
                tagCounts[tag] = count + 1;
            }
        }

        // Filter by query if provided
        var filteredTags = tagCounts.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(query))
        {
            filteredTags = filteredTags.Where(t => t.Key.Contains(query, StringComparison.OrdinalIgnoreCase));
        }

        // Sort by usage count and take limit
        return filteredTags
            .OrderByDescending(t => t.Value)
            .ThenBy(t => t.Key)
            .Take(limit)
            .Select(t => new TagSuggestionDto
            {
                Name = t.Key,
                UsageCount = t.Value,
                Color = GetTagColor(t.Key),
            })
            .ToList();
    }

    private static List<string> ParseTags(string? tags)
    {
        if (string.IsNullOrWhiteSpace(tags))
        {
            return [];
        }

        return tags
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => t.ToLowerInvariant())
            .Distinct()
            .ToList();
    }

    private static string? GetTagColor(string tag)
    {
        // Assign colors based on common tag patterns
        return tag.ToLowerInvariant() switch
        {
            "urgent" or "priority" or "critical" => "#ef4444", // red
            "vip" or "important" => "#f59e0b", // amber
            "follow-up" or "pending" => "#3b82f6", // blue
            "resolved" or "completed" => "#22c55e", // green
            "new" or "fresh" => "#8b5cf6", // purple
            _ => null,
        };
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "Updated tags for conversation {ConversationId}, now has {TagCount} tags")]
    private partial void LogTagsUpdated(Guid conversationId, int tagCount);
}

