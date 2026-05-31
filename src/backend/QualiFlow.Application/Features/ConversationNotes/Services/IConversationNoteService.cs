using QualiFlow.Application.Features.ConversationNotes.DTOs;

namespace QualiFlow.Application.Features.ConversationNotes.Services;

/// <summary>
/// Service interface for conversation note operations.
/// </summary>
public interface IConversationNoteService
{
    /// <summary>
    /// Gets all notes for a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of conversation note responses.</returns>
    Task<IReadOnlyList<ConversationNoteResponse>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a note by ID.
    /// </summary>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The note response if found, null otherwise.</returns>
    Task<ConversationNoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new note.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="request">The create request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created note response.</returns>
    Task<ConversationNoteResponse> CreateAsync(Guid conversationId, CreateConversationNoteRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing note.
    /// </summary>
    /// <param name="id">The note ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated note response if found, null otherwise.</returns>
    Task<ConversationNoteResponse?> UpdateAsync(Guid id, UpdateConversationNoteRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a note.
    /// </summary>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Toggles the pinned status of a note.
    /// </summary>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated note response if found, null otherwise.</returns>
    Task<ConversationNoteResponse?> TogglePinAsync(Guid id, CancellationToken cancellationToken = default);
}

