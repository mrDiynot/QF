// <copyright file="StartWorkflowRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.DTOs;

/// <summary>
/// Request DTO for starting a new workflow instance.
/// </summary>
public class StartWorkflowRequest
{
    /// <summary>
    /// Gets or sets the workflow ID (e.g., "lead-qualification-workflow").
    /// </summary>
    /// <example>lead-qualification-workflow.</example>
    public required string WorkflowId { get; set; }

    /// <summary>
    /// Gets or sets the workflow version (default: 1).
    /// </summary>
    /// <example>1.</example>
    public int Version { get; set; } = 1;

    /// <summary>
    /// Gets or sets the workflow data as JSON string.
    /// The structure depends on the workflow type.
    /// </summary>
    /// <example>{"leadId":"3fa85f64-5717-4562-b3fc-2c963f66afa6","businessId":"3fa85f64-5717-4562-b3fc-2c963f66afa6","leadEmail":"john@example.com"}.</example>
    public required string Data { get; set; }

    /// <summary>
    /// Gets or sets an optional reference ID for tracking (e.g., lead ID, conversation ID).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public string? ReferenceId { get; set; }
}

