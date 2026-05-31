// <copyright file="WorkflowInstanceResponse.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.DTOs;

/// <summary>
/// Response DTO for workflow instance data.
/// </summary>
public class WorkflowInstanceResponse
{
    /// <summary>
    /// Gets or sets the workflow instance ID (Workflow Core's internal ID).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required string WorkflowInstanceId { get; set; }

    /// <summary>
    /// Gets or sets the workflow definition ID.
    /// </summary>
    /// <example>lead-qualification-workflow.</example>
    public required string WorkflowId { get; set; }

    /// <summary>
    /// Gets or sets the workflow version.
    /// </summary>
    /// <example>1.</example>
    public required int Version { get; set; }

    /// <summary>
    /// Gets or sets the workflow status.
    /// </summary>
    /// <example>Running.</example>
    public required string Status { get; set; }

    /// <summary>
    /// Gets or sets when the workflow was created.
    /// </summary>
    /// <example>2025-12-07T10:00:00Z.</example>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the workflow was completed (null if still running).
    /// </summary>
    /// <example>2025-12-07T10:05:00Z.</example>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the workflow data as JSON string.
    /// </summary>
    /// <example>{"leadId":"3fa85f64-5717-4562-b3fc-2c963f66afa6","leadScore":85}.</example>
    public string? Data { get; set; }

    /// <summary>
    /// Gets or sets the reference ID (e.g., lead ID, conversation ID).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public string? ReferenceId { get; set; }
}

