// <copyright file="UpdateWorkflowTemplateRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Workflows.Admin.DTOs;

/// <summary>
/// Request to update an existing workflow template.
/// </summary>
public class UpdateWorkflowTemplateRequest
{
    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    [StringLength(255)]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the template description.
    /// </summary>
    [StringLength(2000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Gets the subscription tiers to assign to.
    /// </summary>
    public ICollection<string>? AssignedToPlans { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether activation requires approval.
    /// </summary>
    public bool? RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the default trigger configuration.
    /// </summary>
    public object? DefaultTrigger { get; set; }

    /// <summary>
    /// Gets the default workflow steps.
    /// </summary>
    public ICollection<object>? DefaultSteps { get; init; }

    /// <summary>
    /// Gets the configurable fields.
    /// </summary>
    public ICollection<string>? ConfigurableFields { get; init; }
}
