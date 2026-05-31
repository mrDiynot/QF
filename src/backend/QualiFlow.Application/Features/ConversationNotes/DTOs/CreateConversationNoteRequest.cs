namespace QualiFlow.Application.Features.ConversationNotes.DTOs;

/// <summary>
/// Request DTO for creating a conversation note.
/// </summary>
public record CreateConversationNoteRequest
{
    /// <summary>
    /// Gets the note content.
    /// </summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>
    /// Gets a value indicating whether the note should be pinned.
    /// </summary>
    public bool IsPinned { get; init; }
}

