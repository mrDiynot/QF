using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for ConversationNote entity operations.
/// </summary>
public interface IConversationNoteRepository
{
    /// <summary>
    /// Gets a note by ID.
    /// </summary>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The note if found, null otherwise.</returns>
    Task<ConversationNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all notes for a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of notes for the conversation.</returns>
    Task<IReadOnlyList<ConversationNote>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pinned notes for a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of pinned notes for the conversation.</returns>
    Task<IReadOnlyList<ConversationNote>> GetPinnedByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new note.
    /// </summary>
    /// <param name="note">The note to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task AddAsync(ConversationNote note, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing note.
    /// </summary>
    /// <param name="note">The note to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task UpdateAsync(ConversationNote note, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a note.
    /// </summary>
    /// <param name="note">The note to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task DeleteAsync(ConversationNote note, CancellationToken cancellationToken = default);
}

