// -----------------------------------------------------------------------
// <copyright file="AdminPlanDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Admin.Billing.DTOs;

/// <summary>
/// DTO for subscription plan management in admin portal.
/// </summary>
public class AdminPlanDto
{
    /// <summary>Gets the plan ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the plan name (lowercase identifier, e.g., "smartflow").</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the display name (e.g., "Smart Flow").</summary>
    public string DisplayName { get; init; } = string.Empty;

    /// <summary>Gets the plan description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the monthly price in USD.</summary>
    public decimal PriceMonthly { get; init; }

    /// <summary>Gets the quarterly price in USD (per month when billed quarterly).</summary>
    public decimal? PriceQuarterly { get; init; }

    /// <summary>Gets the yearly price in USD (per month when billed annually).</summary>
    public decimal? PriceYearly { get; init; }

    /// <summary>Gets the discount percentage for quarterly billing.</summary>
    public int DiscountQuarterly { get; init; }

    /// <summary>Gets the discount percentage for annual billing.</summary>
    public int DiscountAnnual { get; init; }

    /// <summary>Gets the onboarding price in USD.</summary>
    public decimal? OnboardingPrice { get; init; }

    /// <summary>Gets a value indicating whether onboarding is required.</summary>
    public bool OnboardingRequired { get; init; }

    /// <summary>Gets the Stripe Price ID for monthly billing.</summary>
    public string? StripePriceIdMonthly { get; init; }

    /// <summary>Gets the Stripe Price ID for quarterly billing.</summary>
    public string? StripePriceIdQuarterly { get; init; }

    /// <summary>Gets the Stripe Price ID for yearly billing.</summary>
    public string? StripePriceIdYearly { get; init; }

    /// <summary>Gets a value indicating whether the plan allows trials.</summary>
    public bool AllowsTrial { get; init; }

    /// <summary>Gets the number of trial days.</summary>
    public int TrialDays { get; init; }

    /// <summary>Gets a value indicating whether this plan is active.</summary>
    public bool IsActive { get; init; }

    /// <summary>Gets a value indicating whether this plan is publicly visible.</summary>
    public bool IsPublic { get; init; }

    /// <summary>Gets the plan version for grandfathering.</summary>
    public int Version { get; init; }

    /// <summary>Gets the sort order for display.</summary>
    public int SortOrder { get; init; }

    /// <summary>Gets the plan limits as key-value pairs.</summary>
    public IReadOnlyDictionary<string, string> Limits { get; init; } = new Dictionary<string, string>();

    /// <summary>Gets the feature keys enabled for this plan.</summary>
    public IReadOnlyList<string> FeatureKeys { get; init; } = [];

    /// <summary>Gets the created timestamp.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets the updated timestamp.</summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request DTO for creating or updating a subscription plan.
/// </summary>
public class AdminPlanRequest
{
    /// <summary>Gets or sets the plan name (lowercase identifier).</summary>
    public required string Name { get; set; }

    /// <summary>Gets or sets the display name.</summary>
    public required string DisplayName { get; set; }

    /// <summary>Gets or sets the description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the monthly price in USD.</summary>
    public required decimal PriceMonthly { get; set; }

    /// <summary>Gets or sets the quarterly price in USD.</summary>
    public decimal? PriceQuarterly { get; set; }

    /// <summary>Gets or sets the yearly price in USD.</summary>
    public decimal? PriceYearly { get; set; }

    /// <summary>Gets or sets the discount for quarterly billing.</summary>
    public int DiscountQuarterly { get; set; }

    /// <summary>Gets or sets the discount for annual billing.</summary>
    public int DiscountAnnual { get; set; }

    /// <summary>Gets or sets the onboarding price.</summary>
    public decimal? OnboardingPrice { get; set; }

    /// <summary>Gets or sets a value indicating whether onboarding is required.</summary>
    public bool OnboardingRequired { get; set; }

    /// <summary>Gets or sets Stripe Price ID for monthly billing.</summary>
    public string? StripePriceIdMonthly { get; set; }

    /// <summary>Gets or sets Stripe Price ID for quarterly billing.</summary>
    public string? StripePriceIdQuarterly { get; set; }

    /// <summary>Gets or sets Stripe Price ID for yearly billing.</summary>
    public string? StripePriceIdYearly { get; set; }

    /// <summary>Gets or sets a value indicating whether the plan allows trials.</summary>
    public bool AllowsTrial { get; set; }

    /// <summary>Gets or sets the number of trial days.</summary>
    public int TrialDays { get; set; }

    /// <summary>Gets or sets a value indicating whether the plan is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether the plan is publicly visible.</summary>
    public bool IsPublic { get; set; } = true;

    /// <summary>Gets or sets the sort order.</summary>
    public int SortOrder { get; set; }

    /// <summary>Gets or sets a value indicating whether to sync this plan to CMS pricing.</summary>
    public bool SyncToCms { get; set; } = true;
}

