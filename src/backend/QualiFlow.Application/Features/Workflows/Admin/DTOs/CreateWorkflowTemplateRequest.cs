// <copyright file="CreateWorkflowTemplateRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Workflows.Admin.DTOs;

/// <summary>
/// Request to create a new workflow template.
/// </summary>
public class CreateWorkflowTemplateRequest
{
    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    [Required]
    [StringLength(255)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template description.
    /// </summary>
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow category.
    /// </summary>
    [Required]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets the subscription tiers to assign to.
    /// </summary>
    [Required]
    public ICollection<string> AssignedToPlans { get; init; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether activation requires approval.
    /// </summary>
    public bool RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the default trigger configuration.
    /// </summary>
    [Required]
    public object DefaultTrigger { get; set; } = new();

    /// <summary>
    /// Gets the default workflow steps.
    /// </summary>
    [Required]
    public ICollection<object> DefaultSteps { get; init; } = [];

    /// <summary>
    /// Gets the configurable fields.
    /// </summary>
    public ICollection<string> ConfigurableFields { get; init; } = [];
}
