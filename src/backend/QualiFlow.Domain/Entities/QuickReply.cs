using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a quick reply (canned response) template.
/// </summary>
public class QuickReply : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the shortcut code (e.g., "/greeting").
    /// </summary>
    public string Shortcut { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the title/name of the quick reply.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the category for organization.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is a global template.
    /// </summary>
    public bool IsGlobal { get; set; }

    /// <summary>
    /// Gets or sets the user ID who created this (null if global).
    /// </summary>
    public Guid? CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the usage count for analytics.
    /// </summary>
    public int UsageCount { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this quick reply belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who created this quick reply.
    /// </summary>
    public ApplicationUser? CreatedByUser { get; set; }
}

