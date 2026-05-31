// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a chat session.
/// </summary>
public enum ChatSessionStatus
{
    /// <summary>
    /// Session is active and accepting messages.
    /// </summary>
    Active = 0,

    /// <summary>
    /// Session is waiting for agent response.
    /// </summary>
    WaitingForAgent = 1,

    /// <summary>
    /// Session has been transferred to an agent.
    /// </summary>
    TransferredToAgent = 2,

    /// <summary>
    /// Session has been closed by visitor.
    /// </summary>
    ClosedByVisitor = 3,

    /// <summary>
    /// Session has been closed by agent.
    /// </summary>
    ClosedByAgent = 4,

    /// <summary>
    /// Session timed out due to inactivity.
    /// </summary>
    TimedOut = 5,

    /// <summary>
    /// Session was converted to a lead.
    /// </summary>
    ConvertedToLead = 6
}

