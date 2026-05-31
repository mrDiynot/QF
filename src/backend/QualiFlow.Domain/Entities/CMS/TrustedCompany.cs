using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents a trusted company/partner logo for social proof on landing pages.
/// </summary>
public class TrustedCompany : BaseEntity
{
    /// <summary>
    /// Gets or sets the company name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the company logo image path.
    /// </summary>
    public string? LogoPath { get; set; }

    /// <summary>
    /// Gets or sets the company website link.
    /// </summary>
    public string? WebsiteLink { get; set; }

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

