using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a knowledge base article used for AI training and automated responses.
/// Articles can be FAQs, product documentation, company policies, or other reference material.
/// </summary>
public class KnowledgeBaseArticle : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID this article belongs to.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the article title/question.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the article content/answer.
    /// Supports markdown formatting.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the category/topic of the article.
    /// Used for organizing and filtering articles.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets or sets tags for the article (comma-separated or JSON array).
    /// Used for search and categorization.
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this article is active and available for AI training.
    /// Inactive articles are not used by the AI but are retained for reference.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether this article is published and visible.
    /// Unpublished articles are drafts.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the display order/priority of this article.
    /// Higher priority articles appear first in search results.
    /// </summary>
    public int Priority { get; set; }

    /// <summary>
    /// Gets or sets the number of times this article was used/referenced by the AI.
    /// Tracks article usefulness.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets when this article was last used by the AI.
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this article belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
