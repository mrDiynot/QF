// -----------------------------------------------------------------------
// <copyright file="INotificationHubClient.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Strongly-typed client interface for NotificationHub SignalR methods.
/// Defines the methods that can be called on connected clients.
/// </summary>
[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Naming",
    "VSTHRD200:Use 'Async' suffix for async methods",
    Justification = "SignalR client interface methods follow SignalR conventions")]
public interface INotificationHubClient
{
    /// <summary>
    /// Receives a new notification.
    /// </summary>
    /// <param name="notification">The notification data.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReceiveNotification(NotificationEvent notification);

    /// <summary>
    /// Receives a usage alert notification.
    /// </summary>
    /// <param name="alert">The usage alert data.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReceiveUsageAlert(UsageAlertEvent alert);

    /// <summary>
    /// Receives updated notification count.
    /// </summary>
    /// <param name="unreadCount">The unread notification count.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotificationCountUpdated(int unreadCount);

    /// <summary>
    /// Receives a notification marked as read confirmation.
    /// </summary>
    /// <param name="notificationId">The notification ID that was marked as read.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotificationRead(Guid notificationId);
}

/// <summary>
/// Event data for a notification.
/// </summary>
[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Design",
    "CA1056:URI-like properties should not be strings",
    Justification = "SignalR DTO uses string for JSON serialization")]
public record NotificationEvent
{
    /// <summary>
    /// Gets the notification ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the notification type.
    /// </summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Gets the title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the message.
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// Gets the optional action URL.
    /// </summary>
    public string? ActionUrl { get; init; }

    /// <summary>
    /// Gets the optional data payload.
    /// </summary>
    public object? Data { get; init; }

    /// <summary>
    /// Gets the priority.
    /// </summary>
    public string Priority { get; init; } = "Normal";

    /// <summary>
    /// Gets the timestamp.
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets a value indicating whether the notification has been read.
    /// </summary>
    public bool IsRead { get; init; }

    /// <summary>
    /// Gets when the notification was read.
    /// </summary>
    public DateTime? ReadAt { get; init; }
}

/// <summary>
/// Event data for a usage alert.
/// </summary>
public record UsageAlertEvent
{
    /// <summary>
    /// Gets the resource name (leads, messages, channels, etc.).
    /// </summary>
    public string ResourceName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the usage threshold percentage (50, 75, 90, 100).
    /// </summary>
    public int ThresholdPercent { get; init; }

    /// <summary>
    /// Gets the current usage count.
    /// </summary>
    public int CurrentUsage { get; init; }

    /// <summary>
    /// Gets the limit.
    /// </summary>
    public int Limit { get; init; }

    /// <summary>
    /// Gets the timestamp.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}
