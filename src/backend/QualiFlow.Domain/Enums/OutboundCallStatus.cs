// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of an outbound AI call.
/// </summary>
public enum OutboundCallStatus
{
    /// <summary>
    /// Call is pending initiation.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Call is scheduled for future execution.
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Call is being initiated with Twilio.
    /// </summary>
    Initiating = 2,

    /// <summary>
    /// Call is ringing on the recipient's phone.
    /// </summary>
    Ringing = 3,

    /// <summary>
    /// Call is in progress (connected).
    /// </summary>
    InProgress = 4,

    /// <summary>
    /// Call has completed successfully.
    /// </summary>
    Completed = 5,

    /// <summary>
    /// Call failed to connect or encountered an error.
    /// </summary>
    Failed = 6,

    /// <summary>
    /// Call was cancelled before completion.
    /// </summary>
    Cancelled = 7,
}

