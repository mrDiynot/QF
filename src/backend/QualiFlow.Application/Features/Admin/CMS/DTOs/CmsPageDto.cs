using System;

namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// DTO for CMS page.
/// </summary>
public class CmsPageDto
{
    /// <summary>Gets or sets the page ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the page title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the URL slug.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Gets or sets the page content.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Gets or sets the meta title for SEO.</summary>
    public string? MetaTitle { get; set; }

    /// <summary>Gets or sets the meta description for SEO.</summary>
    public string? MetaDescription { get; set; }

    /// <summary>Gets or sets a value indicating whether the page is published.</summary>
    public bool IsPublished { get; set; }

    /// <summary>Gets or sets the published date.</summary>
    public DateTime? PublishedAt { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the section.</summary>
    public string Section { get; set; } = string.Empty;

    /// <summary>Gets or sets the created date.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the updated date.</summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request to create or update a CMS page.
/// </summary>
public class CmsPageRequest
{
    /// <summary>Gets or sets the page title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the URL slug.</summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>Gets or sets the page content.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Gets or sets the meta title for SEO.</summary>
    public string? MetaTitle { get; set; }

    /// <summary>Gets or sets the meta description for SEO.</summary>
    public string? MetaDescription { get; set; }

    /// <summary>Gets or sets a value indicating whether the page is published.</summary>
    public bool IsPublished { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the section.</summary>
    public string Section { get; set; } = string.Empty;
}

