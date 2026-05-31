using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.CMS;

/// <summary>
/// Represents configurable content sections on the landing page.
/// Allows admins to update hero text, statistics, CTAs, etc.
/// </summary>
public class LandingPageContent : BaseEntity
{
    /// <summary>
    /// Gets or sets the section key (hero, stats, features, etc.).
    /// </summary>
    public string SectionKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the content as JSON.
    /// Flexible structure to store various content types.
    /// </summary>
    public string ContentJson { get; set; } = "{}";

    /// <summary>
    /// Gets or sets a value indicating whether this section is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Statistics shown on the landing page (leads qualified, appointments booked, etc.).
/// </summary>
public class LandingPageStatistic : BaseEntity
{
    /// <summary>
    /// Gets or sets the statistic value (e.g., "10M+").
    /// </summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the statistic label (e.g., "Leads Qualified").
    /// </summary>
    public string Label { get; set; } = string.Empty;

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
/// CMS-managed pricing plans for the landing page.
/// Note: This is separate from SubscriptionPlan (billing) - this is display content only.
/// </summary>
public class CmsPricingPlan : BaseEntity
{
    /// <summary>
    /// Gets or sets the plan name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the monthly price display (e.g., "$49" or "Custom").
    /// </summary>
    public string MonthlyPrice { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the annual price display.
    /// </summary>
    public string? AnnualPrice { get; set; }

    /// <summary>
    /// Gets or sets the price period text (e.g., "per month").
    /// </summary>
    public string PricePeriod { get; set; } = "per month";

    /// <summary>
    /// Gets or sets the features list as JSON array.
    /// </summary>
    public string FeaturesJson { get; set; } = "[]";

    /// <summary>
    /// Gets or sets a value indicating whether this is the popular/recommended plan.
    /// </summary>
    public bool IsPopular { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets the CTA button text.
    /// </summary>
    public string CtaText { get; set; } = "Get Started";

    /// <summary>
    /// Gets or sets the CTA link URL.
    /// </summary>
    public string CtaLink { get; set; } = "/register";

    /// <summary>
    /// Gets or sets the description text.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the onboarding price (e.g., 700 for $700).
    /// </summary>
    public decimal? OnboardingPrice { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether onboarding is required.
    /// </summary>
    public bool OnboardingRequired { get; set; }

    /// <summary>
    /// Gets or sets the quarterly price display.
    /// </summary>
    public string? QuarterlyPrice { get; set; }
}

/// <summary>
/// Add-on pricing items for the landing page.
/// </summary>
public class CmsPricingAddOn : BaseEntity
{
    /// <summary>
    /// Gets or sets the add-on title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the price (e.g., "$0.012").
    /// </summary>
    public string Price { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the unit (e.g., "per interaction").
    /// </summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display order.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is active.
    /// </summary>
    public bool IsActive { get; set; } = true;
}

