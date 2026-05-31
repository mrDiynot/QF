using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Feature section type enumeration.
/// </summary>
public enum FeatureSection
{
    /// <summary>Main module section (8 Powerful Modules).</summary>
    Module,

    /// <summary>Feature cards (Perfect For Businesses).</summary>
    FeatureCard,

    /// <summary>Lifecycle steps (Customer Lifecycle Automation).</summary>
    LifecycleStep,
}

/// <summary>
/// Represents a feature module displayed on the landing page.
/// Example: "Omnichannel Lead Capture", "AI Qualification", etc.
/// </summary>
public class FeatureModule : BaseEntity
{
    /// <summary>
    /// Gets or sets the module title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the module description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the icon name (Lucide icon name).
    /// </summary>
    public string IconName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the gradient colors (e.g., "from-cyan-400 to-blue-500").
    /// </summary>
    public string Gradient { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the section type (module, feature, journey).
    /// </summary>
    public FeatureSection Section { get; set; } = FeatureSection.Module;
}

/// <summary>
/// Represents a prebuilt journey displayed on the landing page.
/// </summary>
public class PrebuiltJourney : BaseEntity
{
    /// <summary>
    /// Gets or sets the journey title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the journey description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the icon name (Lucide icon name).
    /// </summary>
    public string IconName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the gradient colors.
    /// </summary>
    public string Gradient { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the background color class.
    /// </summary>
    public string BackgroundColor { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the accent/border color class.
    /// </summary>
    public string AccentColor { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Represents pricing feature comparison data for the landing page table.
/// </summary>
public class PricingFeatureComparison : BaseEntity
{
    /// <summary>
    /// Gets or sets the feature category (e.g., "AI Engagement").
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the feature name.
    /// </summary>
    public string FeatureName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Free Flow value (boolean or string).
    /// </summary>
    public string FreeFlowValue { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the SmartFlow value.
    /// </summary>
    public string SmartFlowValue { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the UltraFlow value.
    /// </summary>
    public string UltraFlowValue { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Enterprise value.
    /// </summary>
    public string EnterpriseValue { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display order within category.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

