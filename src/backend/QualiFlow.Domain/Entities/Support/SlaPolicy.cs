// -----------------------------------------------------------------------
// <copyright file="SlaPolicy.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities.Support;

/// <summary>
/// Represents an SLA policy for a ticket priority level.
/// </summary>
public class SlaPolicy : BaseEntity
{
    /// <summary>
    /// Gets or sets the ticket priority this policy applies to.
    /// </summary>
    public required TicketPriority Priority { get; set; }

    /// <summary>
    /// Gets or sets the first response time in minutes.
    /// </summary>
    public required int FirstResponseMinutes { get; set; }

    /// <summary>
    /// Gets or sets the resolution time in minutes.
    /// </summary>
    public required int ResolutionMinutes { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this policy is active.
    /// </summary>
    public required bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a description of this SLA policy.
    /// </summary>
    public string? Description { get; set; }
}
