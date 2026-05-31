namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// Full blog post DTO for detail views.
/// </summary>
public record BlogPostDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Excerpt { get; init; }
    public string Content { get; init; } = string.Empty;
    public string? FeaturedImagePath { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    public string? AuthorAvatarPath { get; init; }
    public string? Category { get; init; }
    public IReadOnlyList<string> Tags { get; init; } = [];
    public string? MetaTitle { get; init; }
    public string? MetaDescription { get; init; }
    public bool IsPublished { get; init; }
    public DateTime? PublishedAt { get; init; }
    public bool IsFeatured { get; init; }
    public int ReadingTimeMinutes { get; init; }
    public int ViewCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Lightweight blog post DTO for list views.
/// </summary>
public record BlogPostListDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Excerpt { get; init; }
    public string? FeaturedImagePath { get; init; }
    public string AuthorName { get; init; } = string.Empty;
    public string? AuthorAvatarPath { get; init; }
    public string? Category { get; init; }
    public bool IsPublished { get; init; }
    public DateTime? PublishedAt { get; init; }
    public bool IsFeatured { get; init; }
    public int ReadingTimeMinutes { get; init; }
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request DTO for creating a blog post.
/// </summary>
public record CreateBlogPostRequest
{
    public required string Title { get; init; }
    public string? Slug { get; init; }
    public string? Excerpt { get; init; }
    public required string Content { get; init; }
    public string? FeaturedImagePath { get; init; }
    public required string AuthorName { get; init; }
    public string? AuthorAvatarPath { get; init; }
    public string? Category { get; init; }
    public IReadOnlyList<string>? Tags { get; init; }
    public string? MetaTitle { get; init; }
    public string? MetaDescription { get; init; }
    public bool IsPublished { get; init; }
    public bool IsFeatured { get; init; }
}

/// <summary>
/// Request DTO for updating a blog post.
/// </summary>
public record UpdateBlogPostRequest
{
    public string? Title { get; init; }
    public string? Slug { get; init; }
    public string? Excerpt { get; init; }
    public string? Content { get; init; }
    public string? FeaturedImagePath { get; init; }
    public string? AuthorName { get; init; }
    public string? AuthorAvatarPath { get; init; }
    public string? Category { get; init; }
    public IReadOnlyList<string>? Tags { get; init; }
    public string? MetaTitle { get; init; }
    public string? MetaDescription { get; init; }
    public bool? IsPublished { get; init; }
    public bool? IsFeatured { get; init; }
}
