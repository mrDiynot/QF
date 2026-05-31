using AutoMapper;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ConversationNotes.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.ConversationNotes.Services;

/// <summary>
/// Service for conversation note operations.
/// </summary>
public partial class ConversationNoteService : IConversationNoteService
{
    private readonly IConversationNoteRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ILogger<ConversationNoteService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationNoteService"/> class.
    /// </summary>
    /// <param name="repository">The conversation note repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="mapper">The AutoMapper instance.</param>
    /// <param name="logger">The logger instance.</param>
    public ConversationNoteService(
        IConversationNoteRepository repository,
        ICurrentUserService currentUserService,
        IMapper mapper,
        ILogger<ConversationNoteService> logger)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<ConversationNoteResponse>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        var notes = await _repository.GetByConversationIdAsync(conversationId, cancellationToken);
        return _mapper.Map<IReadOnlyList<ConversationNoteResponse>>(notes);
    }

    /// <inheritdoc/>
    public async Task<ConversationNoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _repository.GetByIdAsync(id, cancellationToken);
        return note == null ? null : _mapper.Map<ConversationNoteResponse>(note);
    }

    /// <inheritdoc/>
    public async Task<ConversationNoteResponse> CreateAsync(Guid conversationId, CreateConversationNoteRequest request, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var note = new ConversationNote
        {
            BusinessId = businessId,
            ConversationId = conversationId,
            CreatedByUserId = userId,
            Content = request.Content,
            IsPinned = request.IsPinned,
        };

        await _repository.AddAsync(note, cancellationToken);
        LogNoteCreated(note.Id, conversationId);

        return _mapper.Map<ConversationNoteResponse>(note);
    }

    /// <inheritdoc/>
    public async Task<ConversationNoteResponse?> UpdateAsync(Guid id, UpdateConversationNoteRequest request, CancellationToken cancellationToken = default)
    {
        var note = await _repository.GetByIdAsync(id, cancellationToken);
        if (note == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(request.Content))
        {
            note.Content = request.Content;
        }

        if (request.IsPinned.HasValue)
        {
            note.IsPinned = request.IsPinned.Value;
        }

        await _repository.UpdateAsync(note, cancellationToken);
        LogNoteUpdated(id);

        return _mapper.Map<ConversationNoteResponse>(note);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _repository.GetByIdAsync(id, cancellationToken);
        if (note == null)
        {
            return false;
        }

        await _repository.DeleteAsync(note, cancellationToken);
        LogNoteDeleted(id);

        return true;
    }

    /// <inheritdoc/>
    public async Task<ConversationNoteResponse?> TogglePinAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var note = await _repository.GetByIdAsync(id, cancellationToken);
        if (note == null)
        {
            return null;
        }

        note.IsPinned = !note.IsPinned;
        await _repository.UpdateAsync(note, cancellationToken);
        LogNotePinToggled(id, note.IsPinned);

        return _mapper.Map<ConversationNoteResponse>(note);
    }

    // ============================================================================
    // High-performance logging using LoggerMessage source generator
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Information, Message = "Created note {NoteId} for conversation {ConversationId}")]
    private partial void LogNoteCreated(Guid noteId, Guid conversationId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updated note {NoteId}")]
    private partial void LogNoteUpdated(Guid noteId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleted note {NoteId}")]
    private partial void LogNoteDeleted(Guid noteId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Toggled pin status for note {NoteId} to {IsPinned}")]
    private partial void LogNotePinToggled(Guid noteId, bool isPinned);
}

