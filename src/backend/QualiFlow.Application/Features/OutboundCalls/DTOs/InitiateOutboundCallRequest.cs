// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.OutboundCalls.DTOs;

/// <summary>
/// Request to initiate an outbound AI call.
/// </summary>
public record InitiateOutboundCallRequest
{
    /// <summary>
    /// Gets the lead ID to call.
    /// </summary>
    public Guid LeadId { get; init; }

    /// <summary>
    /// Gets the call script ID to use (optional, uses default if not specified).
    /// </summary>
    public Guid? CallScriptId { get; init; }

    /// <summary>
    /// Gets the from phone number (optional, uses business default if not specified).
    /// </summary>
    public string? FromPhoneNumber { get; init; }

    /// <summary>
    /// Gets the to phone number (optional, uses lead's phone if not specified).
    /// </summary>
    public string? ToPhoneNumber { get; init; }

    /// <summary>
    /// Gets when to schedule the call (optional, calls immediately if not specified).
    /// </summary>
    public DateTime? ScheduledAt { get; init; }

    /// <summary>
    /// Gets the maximum number of retry attempts.
    /// </summary>
    public int MaxRetries { get; init; } = 3;
}

