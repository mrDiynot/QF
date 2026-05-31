using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents a customer testimonial for social proof on landing pages.
/// </summary>
public class Testimonial : BaseEntity
{
    /// <summary>
    /// Gets or sets the testimonial quote text.
    /// </summary>
    public string Quote { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the author's full name.
    /// </summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the author's job title/role.
    /// </summary>
    public string AuthorRole { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the author's company name.
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// Gets or sets the author's avatar/photo image path.
    /// </summary>
    public string? AvatarPath { get; set; }

    /// <summary>
    /// Gets or sets the company logo image path.
    /// </summary>
    public string? CompanyLogoPath { get; set; }

    /// <summary>
    /// Gets or sets the star rating (1-5).
    /// </summary>
    public int Rating { get; set; } = 5;

    /// <summary>
    /// Gets or sets a value indicating whether this is featured.
    /// </summary>
    public bool IsFeatured { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }
}

