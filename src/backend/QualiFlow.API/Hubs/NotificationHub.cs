// -----------------------------------------------------------------------
// <copyright file="NotificationHub.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.API.Hubs;

/// <summary>
/// SignalR hub for real-time notifications.
/// Handles WebSocket connections for live usage alerts, system notifications, and updates.
/// Implements multi-tenancy by grouping connections by business ID and user ID.
/// </summary>
[Authorize]
public partial class NotificationHub : Hub<INotificationHubClient>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<NotificationHub> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationHub"/> class.
    /// </summary>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="logger">The logger.</param>
    public NotificationHub(
        ICurrentUserService currentUserService,
        ILogger<NotificationHub> logger)
    {
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Called when a client connects to the hub.
    /// Adds the client to business and user groups for targeted notifications.
    /// </summary>
    /// <returns>A task representing the async operation.</returns>
    public override async Task OnConnectedAsync()
    {
        var businessId = _currentUserService.TryGetBusinessId();
        var userId = _currentUserService.GetUserId()?.ToString();

        if (businessId.HasValue)
        {
            // Add to business group for business-wide notifications
            var businessGroup = $"business_{businessId.Value}";
            await Groups.AddToGroupAsync(Context.ConnectionId, businessGroup);
            LogUserJoinedBusinessGroup(_logger, userId ?? "unknown", businessId.Value, Context.ConnectionId);
        }

        if (!string.IsNullOrEmpty(userId))
        {
            // Add to user-specific group for targeted notifications
            var userGroup = $"user_{userId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, userGroup);
            LogUserJoinedUserGroup(_logger, userId, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub.
    /// </summary>
    /// <param name="exception">The exception if disconnect was due to error.</param>
    /// <returns>A task representing the async operation.</returns>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _currentUserService.GetUserId()?.ToString();
        LogUserDisconnected(_logger, userId ?? "unknown", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    /// <param name="notificationId">The notification ID.</param>
    /// <returns>A task representing the async operation.</returns>
    public async Task MarkAsReadAsync(Guid notificationId)
    {
        var userId = _currentUserService.GetUserId()?.ToString();
        if (string.IsNullOrEmpty(userId))
        {
            return;
        }

        LogNotificationMarkedRead(_logger, notificationId, userId);

        // Notify all user's connections that the notification was read
        var userGroup = $"user_{userId}";
        await Clients.Group(userGroup).NotificationRead(notificationId);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} joined business notification group {BusinessId} (Connection: {ConnectionId})")]
    private static partial void LogUserJoinedBusinessGroup(ILogger logger, string userId, Guid businessId, string connectionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} joined user notification group (Connection: {ConnectionId})")]
    private static partial void LogUserJoinedUserGroup(ILogger logger, string userId, string connectionId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} disconnected from notifications (Connection: {ConnectionId})")]
    private static partial void LogUserDisconnected(ILogger logger, string userId, string connectionId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Notification {NotificationId} marked as read by user {UserId}")]
    private static partial void LogNotificationMarkedRead(ILogger logger, Guid notificationId, string userId);
}

