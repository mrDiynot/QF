using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents a help/knowledge base article.
/// </summary>
public class HelpArticle : BaseEntity
{
    /// <summary>
    /// Gets or sets the article title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the URL slug.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the article content in HTML or Markdown.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the category.
    /// </summary>
    public string Category { get; set; } = "Getting Started";

    /// <summary>
    /// Gets or sets the tags (comma-separated).
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the display order within category.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets the view count for analytics.
    /// </summary>
    public int ViewCount { get; set; }

    /// <summary>
    /// Gets or sets the helpful vote count.
    /// </summary>
    public int HelpfulCount { get; set; }

    /// <summary>
    /// Gets or sets the not helpful vote count.
    /// </summary>
    public int NotHelpfulCount { get; set; }
}

