// <copyright file="WorkflowDefinitionResponse.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.DTOs;

/// <summary>
/// Response DTO for workflow definition data.
/// </summary>
public class WorkflowDefinitionResponse
{
    /// <summary>
    /// Gets or sets the workflow ID.
    /// </summary>
    /// <example>lead-qualification-workflow.</example>
    public required string WorkflowId { get; set; }

    /// <summary>
    /// Gets or sets the workflow version.
    /// </summary>
    /// <example>1.</example>
    public required int Version { get; set; }

    /// <summary>
    /// Gets or sets the workflow name.
    /// </summary>
    /// <example>Lead Qualification Workflow.</example>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the workflow description.
    /// </summary>
    /// <example>Automated lead qualification process with AI scoring.</example>
    public string? Description { get; set; }
}

