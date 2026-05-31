// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.OutboundCalls.DTOs;

/// <summary>
/// Request to schedule a follow-up call.
/// </summary>
public record ScheduleFollowUpCallRequest
{
    /// <summary>
    /// Gets the lead ID to call.
    /// </summary>
    public Guid LeadId { get; init; }

    /// <summary>
    /// Gets the call script ID to use.
    /// </summary>
    public Guid? CallScriptId { get; init; }

    /// <summary>
    /// Gets when to schedule the call.
    /// </summary>
    public DateTime ScheduledAt { get; init; }

    /// <summary>
    /// Gets the maximum number of retry attempts.
    /// </summary>
    public int MaxRetries { get; init; } = 3;
}

