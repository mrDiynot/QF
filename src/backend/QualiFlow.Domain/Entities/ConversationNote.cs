using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an internal note on a conversation (agent-only visibility).
/// </summary>
public class ConversationNote : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID this note belongs to.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who created the note.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the note content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the note is pinned.
    /// </summary>
    public bool IsPinned { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this note belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the conversation this note belongs to.
    /// </summary>
    public Conversation Conversation { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who created the note.
    /// </summary>
    public ApplicationUser CreatedByUser { get; set; } = null!;
}

