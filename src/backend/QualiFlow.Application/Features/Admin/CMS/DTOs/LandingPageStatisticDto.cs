using System;
using System.Collections.Generic;

#pragma warning disable CA1002 // Do not expose generic lists - DTOs need mutable collections for serialization
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for serialization
#pragma warning disable MA0016 // Prefer using collection abstraction - DTOs need concrete types for serialization

namespace QualiFlow.Application.Features.Admin.CMS.DTOs;

/// <summary>
/// DTO for landing page statistic.
/// </summary>
public class LandingPageStatisticDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the value (e.g., "10M+").</summary>
    public string Value { get; set; } = string.Empty;

    /// <summary>Gets or sets the label (e.g., "Leads Qualified").</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the statistic is active.</summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for trusted company.
/// </summary>
public class TrustedCompanyDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the company name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the logo path.</summary>
    public string? LogoPath { get; set; }

    /// <summary>Gets or sets the website link.</summary>
    public string? WebsiteLink { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the company is active.</summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for feature module.
/// </summary>
public class FeatureModuleDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the description.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Gets or sets the icon name.</summary>
    public string IconName { get; set; } = string.Empty;

    /// <summary>Gets or sets the gradient.</summary>
    public string Gradient { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the module is active.</summary>
    public bool IsActive { get; set; }

    /// <summary>Gets or sets the section type.</summary>
    public string Section { get; set; } = string.Empty;
}

/// <summary>
/// DTO for prebuilt journey.
/// </summary>
public class PrebuiltJourneyDto
{
    /// <summary>Gets or sets the ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the title.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the description.</summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>Gets or sets the icon name.</summary>
    public string IconName { get; set; } = string.Empty;

    /// <summary>Gets or sets the gradient.</summary>
    public string Gradient { get; set; } = string.Empty;

    /// <summary>Gets or sets the background color.</summary>
    public string BackgroundColor { get; set; } = string.Empty;

    /// <summary>Gets or sets the accent color.</summary>
    public string AccentColor { get; set; } = string.Empty;

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether the journey is active.</summary>
    public bool IsActive { get; set; }
}

/// <summary>
/// Complete landing page data DTO.
/// </summary>
public class LandingPageDataDto
{
    /// <summary>Gets or sets the statistics.</summary>
    public List<LandingPageStatisticDto> Statistics { get; set; } = [];

    /// <summary>Gets or sets the trusted companies.</summary>
    public List<TrustedCompanyDto> TrustedCompanies { get; set; } = [];

    /// <summary>Gets or sets the FAQs.</summary>
    public List<FaqDto> Faqs { get; set; } = [];

    /// <summary>Gets or sets the testimonials.</summary>
    public List<TestimonialDto> Testimonials { get; set; } = [];

    /// <summary>Gets or sets the feature modules.</summary>
    public List<FeatureModuleDto> FeatureModules { get; set; } = [];

    /// <summary>Gets or sets the lifecycle steps.</summary>
    public List<FeatureModuleDto> LifecycleSteps { get; set; } = [];

    /// <summary>Gets or sets the feature cards.</summary>
    public List<FeatureModuleDto> FeatureCards { get; set; } = [];

    /// <summary>Gets or sets the prebuilt journeys.</summary>
    public List<PrebuiltJourneyDto> PrebuiltJourneys { get; set; } = [];

    /// <summary>Gets or sets the pricing plans.</summary>
    public List<CmsPricingPlanDto> PricingPlans { get; set; } = [];

    /// <summary>Gets or sets the pricing add-ons.</summary>
    public List<CmsPricingAddOnDto> PricingAddOns { get; set; } = [];

    /// <summary>Gets or sets the feature comparisons.</summary>
    public List<PricingFeatureComparisonDto> FeatureComparisons { get; set; } = [];
}

