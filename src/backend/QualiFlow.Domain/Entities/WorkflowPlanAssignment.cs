// <copyright file="WorkflowPlanAssignment.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents the assignment of a workflow template to a subscription plan.
/// Controls which workflows are available to businesses on each plan tier.
/// </summary>
public class WorkflowPlanAssignment : BaseEntity
{
    /// <summary>
    /// Gets or sets the workflow template ID.
    /// </summary>
    public Guid WorkflowTemplateId { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan ID.
    /// </summary>
    public Guid SubscriptionPlanId { get; set; }

    /// <summary>
    /// Gets or sets the subscription tier this assignment applies to.
    /// </summary>
    public SubscriptionTier PlanTier { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this workflow is included in the plan.
    /// </summary>
    public bool IsIncluded { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether this assignment is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether activation requires approval for this plan.
    /// </summary>
    public bool RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of instances allowed (null = unlimited).
    /// </summary>
    public int? MaxInstances { get; set; }

    /// <summary>
    /// Gets or sets when this assignment was created.
    /// </summary>
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the admin user who created this assignment.
    /// </summary>
    public string? AssignedBy { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the workflow template.
    /// </summary>
    public WorkflowTemplate WorkflowTemplate { get; set; } = null!;

    /// <summary>
    /// Gets or sets the subscription plan.
    /// </summary>
    public SubscriptionPlan SubscriptionPlan { get; set; } = null!;
}
