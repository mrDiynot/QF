// <copyright file="Feature.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a platform feature that can be enabled/disabled per subscription plan.
/// Examples: ai_email, webchat, multi_calendar_routing, no_show_ai.
/// </summary>
public class Feature : BaseEntity
{
    /// <summary>
    /// Gets or sets the feature key (unique identifier).
    /// Examples: "ai_email", "webchat", "multi_calendar_routing".
    /// </summary>
    public required string FeatureKey { get; set; }

    /// <summary>
    /// Gets or sets the display name shown to users.
    /// Examples: "AI Email", "Webchat", "Multi-Calendar Routing".
    /// </summary>
    public required string DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the feature description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the feature category.
    /// Values: "ai_engagement", "automation", "booking", "retention", "crm", "channels", "platform".
    /// </summary>
    public required string Category { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this feature is active.
    /// </summary>
    public required bool IsActive { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets the plan features (many-to-many with SubscriptionPlan).
    /// </summary>
    public ICollection<PlanFeature> PlanFeatures { get; } = [];
}

