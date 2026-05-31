using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents a blog post for content marketing.
/// </summary>
public class BlogPost : BaseEntity
{
    /// <summary>
    /// Gets or sets the blog post title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the URL slug.
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the blog post excerpt/summary.
    /// </summary>
    public string? Excerpt { get; set; }

    /// <summary>
    /// Gets or sets the full content in HTML or Markdown.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the featured image URL path.
    /// </summary>
    public string? FeaturedImagePath { get; set; }

    /// <summary>
    /// Gets or sets the author name.
    /// </summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the author avatar image path.
    /// </summary>
    public string? AuthorAvatarPath { get; set; }

    /// <summary>
    /// Gets or sets the category.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets or sets the tags (comma-separated).
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Gets or sets the meta title for SEO.
    /// </summary>
    public string? MetaTitle { get; set; }

    /// <summary>
    /// Gets or sets the meta description for SEO.
    /// </summary>
    public string? MetaDescription { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the post is published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the publish date.
    /// </summary>
    public DateTime? PublishedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is featured.
    /// </summary>
    public bool IsFeatured { get; set; }

    /// <summary>
    /// Gets or sets the estimated reading time in minutes.
    /// </summary>
    public int ReadingTimeMinutes { get; set; }

    /// <summary>
    /// Gets or sets the view count.
    /// </summary>
    public int ViewCount { get; set; }
}

