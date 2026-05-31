// <copyright file="BusinessWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a workflow instance activated by a business from a template.
/// Tracks business-specific configuration and execution statistics.
/// </summary>
public class BusinessWorkflow : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the workflow template ID this was created from.
    /// </summary>
    public Guid TemplateId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this workflow is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this workflow has been approved (if required).
    /// </summary>
    public bool IsApproved { get; set; } = true;

    /// <summary>
    /// Gets or sets the admin user who approved this workflow.
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Gets or sets when the workflow was approved.
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// Gets or sets the custom configuration as JSON.
    /// Contains business-specific overrides for configurable fields.
    /// </summary>
    public string CustomConfiguration { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the total number of executions.
    /// </summary>
    public int TotalExecutions { get; set; }

    /// <summary>
    /// Gets or sets the number of successful executions.
    /// </summary>
    public int SuccessfulExecutions { get; set; }

    /// <summary>
    /// Gets or sets the number of failed executions.
    /// </summary>
    public int FailedExecutions { get; set; }

    /// <summary>
    /// Gets or sets when this workflow was last executed.
    /// </summary>
    public DateTime? LastExecutedAt { get; set; }

    /// <summary>
    /// Gets or sets when this workflow was activated.
    /// </summary>
    public DateTime? ActivatedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this workflow belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the template this workflow was created from.
    /// </summary>
    public WorkflowTemplate Template { get; set; } = null!;

    /// <summary>
    /// Gets the workflow executions for this business workflow.
    /// </summary>
    public ICollection<WorkflowExecution> Executions { get; } = [];
}
