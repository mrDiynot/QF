using AutoMapper;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.QuickReplies.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.QuickReplies.Services;

/// <summary>
/// Service for quick reply operations.
/// </summary>
public partial class QuickReplyService : IQuickReplyService
{
    private readonly IQuickReplyRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<QuickReplyService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="QuickReplyService"/> class.
    /// </summary>
    /// <param name="repository">The quick reply repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="logger">The logger instance.</param>
    public QuickReplyService(
        IQuickReplyRepository repository,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<QuickReplyService> logger)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<QuickReplyResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var quickReply = await _repository.GetByIdAsync(id, cancellationToken);
        return quickReply == null ? null : _mapper.Map<QuickReplyResponse>(quickReply);
    }

    /// <inheritdoc/>
    public async Task<QuickReplyResponse?> GetByShortcutAsync(string shortcut, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var quickReply = await _repository.GetByShortcutAsync(businessId, shortcut, cancellationToken);
        return quickReply == null ? null : _mapper.Map<QuickReplyResponse>(quickReply);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QuickReplyResponse>> GetAllAsync(string? category = null, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var quickReplies = await _repository.GetAllAsync(businessId, category, cancellationToken);
        return _mapper.Map<IReadOnlyList<QuickReplyResponse>>(quickReplies);
    }

    /// <inheritdoc/>
    public async Task<QuickReplyResponse> CreateAsync(CreateQuickReplyRequest request, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        // Check for duplicate shortcut
        var existing = await _repository.GetByShortcutAsync(businessId, request.Shortcut, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Quick reply with shortcut '{request.Shortcut}' already exists.");
        }

        var quickReply = new QuickReply
        {
            BusinessId = businessId,
            Shortcut = request.Shortcut,
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            IsGlobal = request.IsGlobal,
            CreatedByUserId = userId,
        };

        await _repository.AddAsync(quickReply, cancellationToken);
        LogQuickReplyCreated(quickReply.Id, quickReply.Shortcut);

        return _mapper.Map<QuickReplyResponse>(quickReply);
    }

    /// <inheritdoc/>
    public async Task<QuickReplyResponse?> UpdateAsync(Guid id, UpdateQuickReplyRequest request, CancellationToken cancellationToken = default)
    {
        var quickReply = await _repository.GetByIdAsync(id, cancellationToken);
        if (quickReply == null)
        {
            return null;
        }

        // Check for duplicate shortcut if changing
        if (!string.IsNullOrEmpty(request.Shortcut) && !string.Equals(request.Shortcut, quickReply.Shortcut, StringComparison.Ordinal))
        {
            var businessId = _currentUserService.GetBusinessId();
            var existing = await _repository.GetByShortcutAsync(businessId, request.Shortcut, cancellationToken);
            if (existing != null)
            {
                throw new InvalidOperationException($"Quick reply with shortcut '{request.Shortcut}' already exists.");
            }

            quickReply.Shortcut = request.Shortcut;
        }

        if (!string.IsNullOrEmpty(request.Title))
        {
            quickReply.Title = request.Title;
        }

        if (!string.IsNullOrEmpty(request.Content))
        {
            quickReply.Content = request.Content;
        }

        if (request.Category != null)
        {
            quickReply.Category = request.Category;
        }

        if (request.IsGlobal.HasValue)
        {
            quickReply.IsGlobal = request.IsGlobal.Value;
        }

        await _repository.UpdateAsync(quickReply, cancellationToken);
        LogQuickReplyUpdated(id);

        return _mapper.Map<QuickReplyResponse>(quickReply);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var quickReply = await _repository.GetByIdAsync(id, cancellationToken);
        if (quickReply == null)
        {
            return false;
        }

        await _repository.DeleteAsync(quickReply, cancellationToken);
        LogQuickReplyDeleted(id);

        return true;
    }

    /// <inheritdoc/>
    public Task RecordUsageAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _repository.IncrementUsageCountAsync(id, cancellationToken);
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Created quick reply {QuickReplyId} with shortcut {Shortcut}")]
    private partial void LogQuickReplyCreated(Guid quickReplyId, string shortcut);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated quick reply {QuickReplyId}")]
    private partial void LogQuickReplyUpdated(Guid quickReplyId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted quick reply {QuickReplyId}")]
    private partial void LogQuickReplyDeleted(Guid quickReplyId);
}

