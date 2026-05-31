using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Messages.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Messages.Services;

/// <summary>
/// Service implementation for message operations.
/// </summary>
public partial class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateMessageRequest> _createValidator;
    private readonly IValidator<UpdateMessageRequest> _updateValidator;
    private readonly ILogger<MessageService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessageService"/> class.
    /// </summary>
    /// <param name="messageRepository">The message repository.</param>
    /// <param name="conversationRepository">The conversation repository.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="createValidator">The create request validator.</param>
    /// <param name="updateValidator">The update request validator.</param>
    /// <param name="logger">The logger instance.</param>
    public MessageService(
        IMessageRepository messageRepository,
        IConversationRepository conversationRepository,
        IMapper mapper,
        IValidator<CreateMessageRequest> createValidator,
        IValidator<UpdateMessageRequest> updateValidator,
        ILogger<MessageService> logger)
    {
        _messageRepository = messageRepository;
        _conversationRepository = conversationRepository;
        _mapper = mapper;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedMessageResponse> GetMessagesAsync(
        Guid businessId,
        Guid? conversationId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessages(businessId, conversationId, page, pageSize);

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 10;
        }

        var skip = (page - 1) * pageSize;
        var messages = await _messageRepository.GetAllAsync(
            businessId,
            conversationId,
            skip,
            pageSize,
            cancellationToken);

        var totalItems = await _messageRepository.GetCountAsync(
            businessId,
            conversationId,
            cancellationToken);

        var messageResponses = _mapper.Map<IReadOnlyList<MessageResponse>>(messages);

        return new PagedMessageResponse
        {
            Items = messageResponses,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            HasNextPage = page < (int)Math.Ceiling(totalItems / (double)pageSize),
            HasPreviousPage = page > 1,
        };
    }

    /// <inheritdoc />
    public async Task<MessageResponse?> GetMessageByIdAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogGettingMessage(messageId, businessId);

        var message = await _messageRepository.GetByIdAsync(businessId, messageId, cancellationToken);

        return message == null ? null : _mapper.Map<MessageResponse>(message);
    }

    /// <inheritdoc />
    public async Task<MessageResponse> CreateMessageAsync(
        Guid businessId,
        CreateMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        LogCreatingMessage(request.ConversationId, request.Direction, businessId);

        var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var conversationExists = await _conversationRepository.GetByIdAsync(
            businessId,
            request.ConversationId,
            cancellationToken);

        if (conversationExists == null)
        {
            LogConversationNotFound(request.ConversationId, businessId);
            throw new ValidationException($"Conversation with ID {request.ConversationId} not found");
        }

        var message = _mapper.Map<Message>(request);
        message.CreatedAt = DateTime.UtcNow;

        var createdMessage = await _messageRepository.AddAsync(message, cancellationToken);

        return _mapper.Map<MessageResponse>(createdMessage);
    }

    /// <inheritdoc />
    public async Task<MessageResponse?> UpdateMessageAsync(
        Guid businessId,
        Guid messageId,
        UpdateMessageRequest request,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingMessage(messageId, businessId);

        var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        var message = await _messageRepository.GetByIdAsync(businessId, messageId, cancellationToken);
        if (message == null)
        {
            LogMessageNotFound(messageId, businessId);
            return null;
        }

        ApplyMessageUpdates(message, request);

        await _messageRepository.UpdateAsync(message, cancellationToken);

        return _mapper.Map<MessageResponse>(message);
    }

    /// <inheritdoc />
    public Task<bool> DeleteMessageAsync(
        Guid businessId,
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        LogDeletingMessage(messageId, businessId);

        return _messageRepository.DeleteAsync(businessId, messageId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<bool> MarkAsReadAsync(
        Guid businessId,
        Guid messageId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        LogMarkingMessageAsRead(messageId, userId, businessId);

        return _messageRepository.MarkAsReadAsync(businessId, messageId, userId, cancellationToken);
    }

    /// <inheritdoc />
    public Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        LogGettingUnreadCount(conversationId, userId, businessId);

        return _messageRepository.GetUnreadCountAsync(businessId, conversationId, userId, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<PagedMessageResponse> SearchMessagesAsync(
        Guid businessId,
        string searchTerm,
        Guid? conversationId = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        LogSearchingMessages(businessId, searchTerm, conversationId, page, pageSize);

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new PagedMessageResponse
            {
                Items = [],
                Page = page,
                PageSize = pageSize,
                TotalItems = 0,
                TotalPages = 0,
                HasNextPage = false,
                HasPreviousPage = false,
            };
        }

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 100)
        {
            pageSize = 10;
        }

        var skip = (page - 1) * pageSize;
        var messages = await _messageRepository.SearchAsync(
            businessId,
            searchTerm,
            conversationId,
            skip,
            pageSize,
            cancellationToken);

        var totalItems = await _messageRepository.GetSearchCountAsync(
            businessId,
            searchTerm,
            conversationId,
            cancellationToken);

        var messageResponses = _mapper.Map<IReadOnlyList<MessageResponse>>(messages);

        return new PagedMessageResponse
        {
            Items = messageResponses,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            HasNextPage = page < (int)Math.Ceiling(totalItems / (double)pageSize),
            HasPreviousPage = page > 1,
        };
    }

    private static void ApplyMessageUpdates(Message message, UpdateMessageRequest request)
    {
        if (!string.IsNullOrEmpty(request.Content))
        {
            message.Content = request.Content;
        }

        if (request.DeliveredAt.HasValue)
        {
            message.DeliveredAt = request.DeliveredAt.Value;
        }

        if (request.ReadAt.HasValue)
        {
            message.ReadAt = request.ReadAt.Value;
        }

        message.UpdatedAt = DateTime.UtcNow;
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting messages for business {BusinessId} with conversationId {ConversationId}, page {Page}, pageSize {PageSize}")]
    private partial void LogGettingMessages(Guid businessId, Guid? conversationId, int page, int pageSize);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting message {MessageId} for business {BusinessId}")]
    private partial void LogGettingMessage(Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating message for conversation {ConversationId} with direction {Direction} for business {BusinessId}")]
    private partial void LogCreatingMessage(Guid conversationId, QualiFlow.Domain.Enums.MessageDirection direction, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Conversation {ConversationId} not found for business {BusinessId}")]
    private partial void LogConversationNotFound(Guid conversationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating message {MessageId} for business {BusinessId}")]
    private partial void LogUpdatingMessage(Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Message {MessageId} not found for business {BusinessId}")]
    private partial void LogMessageNotFound(Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting message {MessageId} for business {BusinessId}")]
    private partial void LogDeletingMessage(Guid messageId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Marking message {MessageId} as read by user {UserId} for business {BusinessId}")]
    private partial void LogMarkingMessageAsRead(Guid messageId, Guid userId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting unread count for conversation {ConversationId} and user {UserId} in business {BusinessId}")]
    private partial void LogGettingUnreadCount(Guid conversationId, Guid userId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Searching messages for business {BusinessId} with term '{SearchTerm}' in conversation {ConversationId}, page {Page}, pageSize {PageSize}")]
    private partial void LogSearchingMessages(Guid businessId, string searchTerm, Guid? conversationId, int page, int pageSize);
}

