// <copyright file="WorkflowTemplate.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a global workflow template managed by admins.
/// Templates can be assigned to subscription plans and activated by businesses.
/// </summary>
public class WorkflowTemplate : BaseEntity
{
    /// <summary>
    /// Gets or sets the workflow ID matching the WorkflowCore definition.
    /// </summary>
    public string WorkflowId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow category.
    /// </summary>
    public WorkflowCategory Category { get; set; } = WorkflowCategory.Custom;

    /// <summary>
    /// Gets or sets the trigger type.
    /// </summary>
    public WorkflowTriggerType TriggerType { get; set; } = WorkflowTriggerType.Event;

    /// <summary>
    /// Gets or sets the trigger description.
    /// </summary>
    public string TriggerDescription { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of steps in the workflow.
    /// </summary>
    public int StepCount { get; set; }

    /// <summary>
    /// Gets or sets the estimated time in minutes.
    /// </summary>
    public int EstimatedTimeMinutes { get; set; }

    /// <summary>
    /// Gets or sets the icon emoji.
    /// </summary>
    public string Icon { get; set; } = "⚡";

    /// <summary>
    /// Gets or sets a value indicating whether this template is active and available.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether this is a prebuilt template.
    /// </summary>
    public bool IsPrebuilt { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether this is a global template (managed by admins).
    /// </summary>
    public bool IsGlobalTemplate { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether activation requires admin approval.
    /// </summary>
    public bool RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the minimum subscription tier required.
    /// </summary>
    public SubscriptionTier RequiredTier { get; set; } = SubscriptionTier.FreeFlow;

    /// <summary>
    /// Gets or sets the default trigger configuration as JSON.
    /// </summary>
    public string DefaultTrigger { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the default workflow steps as JSON array.
    /// </summary>
    public string DefaultSteps { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the configurable fields as JSON array.
    /// Lists which fields businesses can customize when activating.
    /// </summary>
    public string ConfigurableFields { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the admin user who created this template.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the template version number.
    /// </summary>
    public int Version { get; set; } = 1;

    // Navigation properties

    /// <summary>
    /// Gets the plan assignments for this template.
    /// </summary>
    public ICollection<WorkflowPlanAssignment> PlanAssignments { get; } = [];

    /// <summary>
    /// Gets the business workflows created from this template.
    /// </summary>
    public ICollection<BusinessWorkflow> BusinessWorkflows { get; } = [];

    /// <summary>
    /// Gets the approval requests for this template.
    /// </summary>
    public ICollection<WorkflowApprovalRequest> ApprovalRequests { get; } = [];
}
