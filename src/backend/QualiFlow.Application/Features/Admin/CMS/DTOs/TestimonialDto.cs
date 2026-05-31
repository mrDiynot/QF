using System;

namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// DTO for testimonial.
/// </summary>
public class TestimonialDto
{
    /// <summary>Gets or sets the testimonial ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the quote.</summary>
    public string Quote { get; set; } = string.Empty;

    /// <summary>Gets or sets the author name.</summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>Gets or sets the author role.</summary>
    public string AuthorRole { get; set; } = string.Empty;

    /// <summary>Gets or sets the company name.</summary>
    public string? CompanyName { get; set; }

    /// <summary>Gets or sets the avatar path.</summary>
    public string? AvatarPath { get; set; }

    /// <summary>Gets or sets the company logo path.</summary>
    public string? CompanyLogoPath { get; set; }

    /// <summary>Gets or sets the rating (1-5).</summary>
    public int Rating { get; set; }

    /// <summary>Gets or sets a value indicating whether the testimonial is featured.</summary>
    public bool IsFeatured { get; set; }

    /// <summary>Gets or sets a value indicating whether the testimonial is active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the created date.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the updated date.</summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request to create or update a testimonial.
/// </summary>
public class TestimonialRequest
{
    /// <summary>Gets or sets the quote.</summary>
    public string Quote { get; set; } = string.Empty;

    /// <summary>Gets or sets the author name.</summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>Gets or sets the author role.</summary>
    public string AuthorRole { get; set; } = string.Empty;

    /// <summary>Gets or sets the company name.</summary>
    public string? CompanyName { get; set; }

    /// <summary>Gets or sets the avatar path.</summary>
    public string? AvatarPath { get; set; }

    /// <summary>Gets or sets the company logo path.</summary>
    public string? CompanyLogoPath { get; set; }

    /// <summary>Gets or sets the rating (1-5).</summary>
    public int Rating { get; set; } = 5;

    /// <summary>Gets or sets a value indicating whether the testimonial is featured.</summary>
    public bool IsFeatured { get; set; }

    /// <summary>Gets or sets a value indicating whether the testimonial is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }
}

