namespace QualiFlow.Application.Features.ConversationNotes.DTOs;

/// <summary>
/// Request DTO for updating a conversation note.
/// </summary>
public record UpdateConversationNoteRequest
{
    /// <summary>
    /// Gets the note content.
    /// </summary>
    public string? Content { get; init; }

    /// <summary>
    /// Gets a value indicating whether the note should be pinned.
    /// </summary>
    public bool? IsPinned { get; init; }
}

