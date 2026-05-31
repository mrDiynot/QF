// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the outcome of an outbound AI call.
/// </summary>
public enum OutboundCallOutcome
{
    /// <summary>
    /// Human answered the call.
    /// </summary>
    Connected = 0,

    /// <summary>
    /// Answering machine or voicemail detected.
    /// </summary>
    Voicemail = 1,

    /// <summary>
    /// Call was not answered (ring timeout).
    /// </summary>
    NoAnswer = 2,

    /// <summary>
    /// Busy signal received.
    /// </summary>
    Busy = 3,

    /// <summary>
    /// Call failed to connect due to technical issues.
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Call was rejected or declined by recipient.
    /// </summary>
    Rejected = 5,
}

