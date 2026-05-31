// <copyright file="PublishEventRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Workflows.DTOs;

/// <summary>
/// Request DTO for publishing an event to a workflow.
/// Used to trigger WaitFor steps in workflows.
/// </summary>
public class PublishEventRequest
{
    /// <summary>
    /// Gets or sets the event name (must match the WaitFor event name in the workflow).
    /// </summary>
    /// <example>lead-response.</example>
    public required string EventName { get; set; }

    /// <summary>
    /// Gets or sets the event key (used to identify which workflow instance to resume).
    /// </summary>
    /// <example>3fa85f64-5717-4562-b3fc-2c963f66afa6.</example>
    public required string EventKey { get; set; }

    /// <summary>
    /// Gets or sets the event data as JSON string.
    /// </summary>
    /// <example>{"response":"Interested in demo"}.</example>
    public string? EventData { get; set; }
}

