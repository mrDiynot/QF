// -----------------------------------------------------------------------
// <copyright file="NotificationPriority.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Notification priority levels.
/// </summary>
public enum NotificationPriority
{
    /// <summary>
    /// Low priority.
    /// </summary>
    Low = 0,

    /// <summary>
    /// Normal priority.
    /// </summary>
    Normal = 1,

    /// <summary>
    /// High priority.
    /// </summary>
    High = 2,

    /// <summary>
    /// Urgent priority.
    /// </summary>
    Urgent = 3,
}

