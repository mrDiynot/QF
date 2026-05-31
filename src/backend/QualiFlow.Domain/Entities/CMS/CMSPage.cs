using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Page section enumeration.
/// </summary>
public enum PageSection
{
    /// <summary>Header navigation pages.</summary>
    Header,

    /// <summary>Footer navigation pages.</summary>
    Footer,

    /// <summary>Legal pages (terms, privacy, etc.).</summary>
    Legal,

    /// <summary>Other pages.</summary>
    Other,
}

/// <summary>
/// Represents a CMS page for static content management.
/// Pages can be used for terms of service, privacy policy, about, etc.
/// </summary>
public class CmsPage : BaseEntity
{
    /// <summary>
    /// Gets or sets the page title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the URL slug (e.g., "terms-of-service").
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the page content in HTML or Markdown format.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the meta title for SEO.
    /// </summary>
    public string? MetaTitle { get; set; }

    /// <summary>
    /// Gets or sets the meta description for SEO.
    /// </summary>
    public string? MetaDescription { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the page is published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the publish date.
    /// </summary>
    public DateTime? PublishedAt { get; set; }

    /// <summary>
    /// Gets or sets the display order for navigation.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets the page section (header, footer, legal, etc.).
    /// </summary>
    public PageSection Section { get; set; } = PageSection.Other;
}

