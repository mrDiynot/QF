namespace QualiFlow.Application.Features.ConversationNotes.DTOs;

/// <summary>
/// Response DTO for conversation note.
/// </summary>
public record ConversationNoteResponse
{
    /// <summary>
    /// Gets the note ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; init; }

    /// <summary>
    /// Gets the user ID who created the note.
    /// </summary>
    public Guid CreatedByUserId { get; init; }

    /// <summary>
    /// Gets the name of the user who created the note.
    /// </summary>
    public string? CreatedByUserName { get; init; }

    /// <summary>
    /// Gets the note content.
    /// </summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>
    /// Gets a value indicating whether the note is pinned.
    /// </summary>
    public bool IsPinned { get; init; }

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the last update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }
}

