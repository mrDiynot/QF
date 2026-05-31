// -----------------------------------------------------------------------
// <copyright file="InvitationStatus.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a team member invitation.
/// </summary>
public enum InvitationStatus
{
    /// <summary>
    /// Invitation has been sent and is awaiting acceptance.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Invitation has been accepted by the user.
    /// </summary>
    Accepted = 1,

    /// <summary>
    /// Invitation has expired (not accepted within validity period).
    /// </summary>
    Expired = 2,

    /// <summary>
    /// Invitation was cancelled by an admin/owner before acceptance.
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Invitation was declined by the invitee.
    /// </summary>
    Declined = 4
}

