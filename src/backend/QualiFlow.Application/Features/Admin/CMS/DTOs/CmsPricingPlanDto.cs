using System;
using System.Collections.Generic;

#pragma warning disable CA1002 // Do not expose generic lists - DTOs need mutable collections for serialization
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for serialization
#pragma warning disable MA0016 // Prefer using collection abstraction - DTOs need concrete types for serialization

namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// DTO for CMS pricing plan.
/// </summary>
public class CmsPricingPlanDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the plan name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the monthly price.</summary>
    public string MonthlyPrice { get; set; } = string.Empty;

    /// <summary>Gets or sets the annual price.</summary>
    public string? AnnualPrice { get; set; }

    /// <summary>Gets or sets the price period.</summary>
    public string PricePeriod { get; set; } = string.Empty;

    /// <summary>Gets or sets the features as a list.</summary>
    public List<string> Features { get; set; } = [];

    /// <summary>Gets or sets a value indicating whether this plan is popular.</summary>
    public bool IsPopular { get; set; }

    /// <summary>Gets or sets a value indicating whether the plan is active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the CTA text.</summary>
    public string CtaText { get; set; } = string.Empty;

    /// <summary>Gets or sets the CTA link.</summary>
    public string CtaLink { get; set; } = string.Empty;

    /// <summary>Gets or sets the description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the onboarding price.</summary>
    public decimal? OnboardingPrice { get; set; }

    /// <summary>Gets or sets a value indicating whether onboarding is required.</summary>
    public bool OnboardingRequired { get; set; }

    /// <summary>Gets or sets the quarterly price.</summary>
    public string? QuarterlyPrice { get; set; }
}

/// <summary>
/// DTO for CMS pricing add-on.
/// </summary>
public class CmsPricingAddOnDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the price.</summary>
    public string Price { get; set; } = string.Empty;

    /// <summary>Gets or sets the unit.</summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the add-on is active.</summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for pricing feature comparison.
/// </summary>
public class PricingFeatureComparisonDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the category.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Gets or sets the feature name.</summary>
    public string FeatureName { get; set; } = string.Empty;

    /// <summary>Gets or sets the Free Flow value.</summary>
    public string FreeFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Smart Flow value.</summary>
    public string SmartFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Ultra Flow value.</summary>
    public string UltraFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Enterprise value.</summary>
    public string EnterpriseValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the comparison is active.</summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// Request to create or update a pricing add-on.
/// </summary>
public class CmsPricingAddOnRequest
{
    /// <summary>Gets or sets the title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the price.</summary>
    public string Price { get; set; } = string.Empty;

    /// <summary>Gets or sets the unit.</summary>
    public string Unit { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the add-on is active.</summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Request to create or update a feature comparison.
/// </summary>
public class PricingFeatureComparisonRequest
{
    /// <summary>Gets or sets the category.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>Gets or sets the feature name.</summary>
    public string FeatureName { get; set; } = string.Empty;

    /// <summary>Gets or sets the Free Flow value.</summary>
    public string FreeFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Smart Flow value.</summary>
    public string SmartFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Ultra Flow value.</summary>
    public string UltraFlowValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the Enterprise value.</summary>
    public string EnterpriseValue { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the comparison is active.</summary>
    public bool IsActive { get; set; } = true;
}

