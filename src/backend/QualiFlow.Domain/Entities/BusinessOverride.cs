// <copyright file="BusinessOverride.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a custom override for a specific business (custom contracts).
/// Allows granting features or increasing limits beyond the standard plan.
/// </summary>
public class BusinessOverride : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public required Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the override type.
    /// Values: "feature", "limit".
    /// </summary>
    public required string OverrideType { get; set; }

    /// <summary>
    /// Gets or sets the override key.
    /// For features: "ai_email", "webchat", etc.
    /// For limits: "max_ai_interactions", "max_seats", etc.
    /// </summary>
    public required string OverrideKey { get; set; }

    /// <summary>
    /// Gets or sets the override value.
    /// For features: "true" or "false".
    /// For limits: numeric value or "unlimited".
    /// </summary>
    public required string OverrideValue { get; set; }

    /// <summary>
    /// Gets or sets the reason for the override.
    /// Example: "Custom enterprise contract", "Promotional offer".
    /// </summary>
    public required string Reason { get; set; }

    /// <summary>
    /// Gets or sets the expiration date (null = permanent).
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the admin user ID who created the override.
    /// </summary>
    public required Guid CreatedBy { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;
}

