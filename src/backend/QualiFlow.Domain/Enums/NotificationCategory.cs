// -----------------------------------------------------------------------
// <copyright file="NotificationCategory.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Categories for grouping notifications in the UI.
/// </summary>
public enum NotificationCategory
{
    /// <summary>
    /// All notifications (no filter).
    /// </summary>
    All = 0,

    /// <summary>
    /// Subscription and billing notifications.
    /// </summary>
    Billing = 1,

    /// <summary>
    /// Lead and conversation notifications.
    /// </summary>
    Leads = 2,

    /// <summary>
    /// Booking notifications.
    /// </summary>
    Bookings = 3,

    /// <summary>
    /// Team and collaboration notifications.
    /// </summary>
    Team = 4,

    /// <summary>
    /// Integration notifications (webhooks, channels, CRM).
    /// </summary>
    Integrations = 5,

    /// <summary>
    /// System and admin notifications.
    /// </summary>
    System = 6,
}

