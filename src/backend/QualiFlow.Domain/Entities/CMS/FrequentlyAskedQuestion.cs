using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents a frequently asked question for the landing page and help center.
/// </summary>
public class FrequentlyAskedQuestion : BaseEntity
{
    /// <summary>
    /// Gets or sets the question text.
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the answer text.
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the FAQ category.
    /// </summary>
    public string Category { get; set; } = "General";

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this FAQ is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to show on landing page.
    /// </summary>
    public bool ShowOnLandingPage { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to show in help center.
    /// </summary>
    public bool ShowInHelpCenter { get; set; } = true;
}

