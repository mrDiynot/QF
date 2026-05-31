// <copyright file="SubscriptionPlan.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a subscription plan (FreeFlow, SmartFlow, UltraFlow, Enterprise).
/// Replaces the enum-based SubscriptionTier with database-driven plans.
/// </summary>
public class SubscriptionPlan : BaseEntity
{
    /// <summary>
    /// Gets or sets the plan name (lowercase, unique identifier).
    /// Examples: "freeflow", "smartflow", "ultraflow", "enterprise".
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the display name shown to users.
    /// Examples: "Free Flow", "Smart Flow", "Ultra Flow", "Enterprise".
    /// </summary>
    public required string DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the plan description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the monthly price in USD.
    /// </summary>
    public required decimal PriceMonthly { get; set; }

    /// <summary>
    /// Gets or sets the quarterly price in USD (optional, per month when billed quarterly).
    /// </summary>
    public decimal? PriceQuarterly { get; set; }

    /// <summary>
    /// Gets or sets the yearly price in USD (optional, per month when billed annually).
    /// </summary>
    public decimal? PriceYearly { get; set; }

    /// <summary>
    /// Gets or sets the discount percentage for quarterly billing (e.g., 10 for 10% off).
    /// </summary>
    public int DiscountQuarterly { get; set; }

    /// <summary>
    /// Gets or sets the discount percentage for annual billing (e.g., 20 for 20% off).
    /// </summary>
    public int DiscountAnnual { get; set; }

    /// <summary>
    /// Gets or sets the onboarding price in USD (optional).
    /// </summary>
    public decimal? OnboardingPrice { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether onboarding is required for this plan.
    /// </summary>
    public bool OnboardingRequired { get; set; }

    /// <summary>
    /// Gets or sets the Stripe Price ID for monthly billing.
    /// </summary>
    public string? StripePriceIdMonthly { get; set; }

    /// <summary>
    /// Gets or sets the Stripe Price ID for quarterly billing.
    /// </summary>
    public string? StripePriceIdQuarterly { get; set; }

    /// <summary>
    /// Gets or sets the Stripe Price ID for yearly billing.
    /// </summary>
    public string? StripePriceIdYearly { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this plan allows a free trial period.
    /// </summary>
    public bool AllowsTrial { get; set; }

    /// <summary>
    /// Gets or sets the number of trial days for this plan (0 if no trial).
    /// </summary>
    public int TrialDays { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether new subscriptions can be created for this plan.
    /// </summary>
    public required bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this plan is visible on the pricing page.
    /// </summary>
    public required bool IsPublic { get; set; }

    /// <summary>
    /// Gets or sets the plan version for grandfathering.
    /// When a plan is updated, a new version is created to preserve existing subscriptions.
    /// </summary>
    public required int Version { get; set; }

    /// <summary>
    /// Gets or sets the sort order for display on the pricing page.
    /// </summary>
    public required int SortOrder { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets the plan limits.
    /// </summary>
    public ICollection<PlanLimit> Limits { get; } = [];

    /// <summary>
    /// Gets the plan features.
    /// </summary>
    public ICollection<PlanFeature> Features { get; } = [];

    /// <summary>
    /// Gets the subscriptions using this plan.
    /// </summary>
    public ICollection<Subscription> Subscriptions { get; } = [];
}

