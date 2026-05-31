// <copyright file="PlanFeature.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Junction table for many-to-many relationship between SubscriptionPlan and Feature.
/// </summary>
public class PlanFeature : BaseEntity
{
    /// <summary>
    /// Gets or sets the subscription plan ID.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the feature ID.
    /// </summary>
    public required Guid FeatureId { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the subscription plan.
    /// </summary>
    public SubscriptionPlan Plan { get; set; } = null!;

    /// <summary>
    /// Gets or sets the feature.
    /// </summary>
    public Feature Feature { get; set; } = null!;
}

