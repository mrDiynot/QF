// -----------------------------------------------------------------------
// <copyright file="AdminFeatureDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Admin.Billing.DTOs;

/// <summary>
/// DTO for feature management in admin portal.
/// </summary>
public class AdminFeatureDto
{
    /// <summary>Gets the feature ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the feature key (unique identifier, e.g., "ai_email").</summary>
    public string FeatureKey { get; init; } = string.Empty;

    /// <summary>Gets the display name (e.g., "AI Email").</summary>
    public string DisplayName { get; init; } = string.Empty;

    /// <summary>Gets the feature description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the feature category.</summary>
    public string Category { get; init; } = string.Empty;

    /// <summary>Gets a value indicating whether this feature is active.</summary>
    public bool IsActive { get; init; }

    /// <summary>Gets the plans that have this feature enabled.</summary>
    public IReadOnlyList<string> EnabledInPlans { get; init; } = [];

    /// <summary>Gets the created timestamp.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets the updated timestamp.</summary>
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// Request DTO for creating or updating a feature.
/// </summary>
public class AdminFeatureRequest
{
    /// <summary>Gets or sets the feature key (unique identifier).</summary>
    public required string FeatureKey { get; set; }

    /// <summary>Gets or sets the display name.</summary>
    public required string DisplayName { get; set; }

    /// <summary>Gets or sets the description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the feature category.</summary>
    public required string Category { get; set; }

    /// <summary>Gets or sets a value indicating whether the feature is active.</summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO for plan limit management.
/// </summary>
public class AdminPlanLimitDto
{
    /// <summary>Gets the limit ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the plan ID.</summary>
    public Guid PlanId { get; init; }

    /// <summary>Gets the plan name.</summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>Gets the limit key (e.g., "max_leads").</summary>
    public string LimitKey { get; init; } = string.Empty;

    /// <summary>Gets the limit value (e.g., "500" or "unlimited").</summary>
    public string LimitValue { get; init; } = string.Empty;

    /// <summary>Gets the limit type (integer, boolean, string).</summary>
    public string LimitType { get; init; } = string.Empty;

    /// <summary>Gets the created timestamp.</summary>
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request DTO for creating or updating a plan limit.
/// </summary>
public class AdminPlanLimitRequest
{
    /// <summary>Gets or sets the plan ID.</summary>
    public required Guid PlanId { get; set; }

    /// <summary>Gets or sets the limit key.</summary>
    public required string LimitKey { get; set; }

    /// <summary>Gets or sets the limit value.</summary>
    public required string LimitValue { get; set; }

    /// <summary>Gets or sets the limit type.</summary>
    public string LimitType { get; set; } = "integer";
}

/// <summary>
/// Request DTO for assigning a feature to a plan.
/// </summary>
public class AdminPlanFeatureRequest
{
    /// <summary>Gets or sets the plan ID.</summary>
    public required Guid PlanId { get; set; }

    /// <summary>Gets or sets the feature ID.</summary>
    public required Guid FeatureId { get; set; }
}

/// <summary>
/// DTO for plan feature assignment.
/// </summary>
public class AdminPlanFeatureDto
{
    /// <summary>Gets the plan feature assignment ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the plan ID.</summary>
    public Guid PlanId { get; init; }

    /// <summary>Gets the plan name.</summary>
    public string PlanName { get; init; } = string.Empty;

    /// <summary>Gets the feature ID.</summary>
    public Guid FeatureId { get; init; }

    /// <summary>Gets the feature key.</summary>
    public string FeatureKey { get; init; } = string.Empty;

    /// <summary>Gets the feature display name.</summary>
    public string FeatureDisplayName { get; init; } = string.Empty;

    /// <summary>Gets the created timestamp.</summary>
    public DateTime CreatedAt { get; init; }
}

