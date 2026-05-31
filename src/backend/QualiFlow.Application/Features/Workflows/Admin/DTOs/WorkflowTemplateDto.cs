// <copyright file="WorkflowTemplateDto.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Workflows.Admin.DTOs;

/// <summary>
/// DTO for workflow template information.
/// </summary>
public class WorkflowTemplateDto
{
    /// <summary>
    /// Gets or sets the template ID.
    /// </summary>
    public Guid Id { get; set; }

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
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is a global template.
    /// </summary>
    public bool IsGlobalTemplate { get; set; }

    /// <summary>
    /// Gets the subscription tiers this template is assigned to.
    /// </summary>
    public IReadOnlyCollection<string> AssignedToPlans { get; init; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether activation requires approval.
    /// </summary>
    public bool RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the default trigger configuration.
    /// </summary>
    public object? DefaultTrigger { get; set; }

    /// <summary>
    /// Gets the default workflow steps.
    /// </summary>
    public IReadOnlyCollection<object>? DefaultSteps { get; init; }

    /// <summary>
    /// Gets the configurable fields.
    /// </summary>
    public IReadOnlyCollection<string>? ConfigurableFields { get; init; }

    /// <summary>
    /// Gets or sets the total number of businesses using this template.
    /// </summary>
    public int TotalBusinesses { get; set; }

    /// <summary>
    /// Gets or sets the total number of executions.
    /// </summary>
    public int TotalExecutions { get; set; }

    /// <summary>
    /// Gets or sets the average success rate.
    /// </summary>
    public double AverageSuccessRate { get; set; }

    /// <summary>
    /// Gets or sets when the template was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the template was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets who created the template.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the template version.
    /// </summary>
    public int Version { get; set; }
}
