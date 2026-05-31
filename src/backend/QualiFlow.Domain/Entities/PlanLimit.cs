// <copyright file="PlanLimit.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a usage limit for a subscription plan.
/// Examples: max_ai_interactions, max_ai_voice_minutes, max_seats.
/// </summary>
public class PlanLimit : BaseEntity
{
    /// <summary>
    /// Gets or sets the subscription plan ID.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the limit key (unique identifier).
    /// Examples: "max_ai_interactions", "max_ai_voice_minutes", "max_seats".
    /// </summary>
    public required string LimitKey { get; set; }

    /// <summary>
    /// Gets or sets the limit value.
    /// Can be a number (e.g., "50", "250") or "unlimited".
    /// </summary>
    public required string LimitValue { get; set; }

    /// <summary>
    /// Gets or sets the limit type.
    /// Values: "integer", "boolean", "string".
    /// </summary>
    public required string LimitType { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the subscription plan.
    /// </summary>
    public SubscriptionPlan Plan { get; set; } = null!;
}

