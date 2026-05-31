// -----------------------------------------------------------------------
// <copyright file="Notification.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics.CodeAnalysis;
using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an in-app notification for a user.
/// </summary>
public class Notification : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID this notification is for.
    /// If null, notification is for all users in the business.
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Gets or sets the notification type.
    /// </summary>
    public NotificationType Type { get; set; }

    /// <summary>
    /// Gets or sets the notification title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the notification message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets optional data payload as JSON.
    /// </summary>
    public string? DataJson { get; set; }

    /// <summary>
    /// Gets or sets the action URL (if notification is clickable).
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database")]
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the notification has been read.
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Gets or sets the date/time when the notification was read.
    /// </summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Gets or sets the priority level.
    /// </summary>
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user (if targeted to specific user).
    /// </summary>
    public ApplicationUser? User { get; set; }
}
