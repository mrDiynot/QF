// -----------------------------------------------------------------------
// <copyright file="NotificationsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for notification operations.
/// Provides endpoints for fetching and managing user notifications.
/// All operations are scoped to the authenticated user's business (tenant).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public partial class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<NotificationsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationsController"/> class.
    /// </summary>
    public NotificationsController(
        INotificationService notificationService,
        ICurrentUserService currentUserService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets notifications for the current user.
    /// </summary>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Number of items per page (default: 20, max: 100).</param>
    /// <param name="unreadOnly">If true, only return unread notifications.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of notifications.</returns>
    [HttpGet]
    [NoCache]
    [ProducesResponseType(typeof(NotificationsPagedResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<NotificationsPagedResponse>> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool unreadOnly = false,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId() ?? Guid.Empty;

        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(1, page);

        var result = await _notificationService.GetNotificationsAsync(
            businessId, userId, page, pageSize, unreadOnly, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets the unread notification count for the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Unread count object.</returns>
    [HttpGet("unread-count")]
    [NoCache]
    [ProducesResponseType(typeof(UnreadCountResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UnreadCountResponse>> GetUnreadCount(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId() ?? Guid.Empty;

        var count = await _notificationService.GetUnreadCountAsync(
            businessId, userId, cancellationToken);

        return Ok(new UnreadCountResponse { Count = count });
    }

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    /// <param name="id">The notification ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpPatch("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.GetUserId() ?? Guid.Empty;

        var success = await _notificationService.MarkAsReadAsync(id, userId, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Marks all notifications as read for the current user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of notifications marked as read.</returns>
    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(MarkAllAsReadResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<MarkAllAsReadResponse>> MarkAllAsRead(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId() ?? Guid.Empty;

        var count = await _notificationService.MarkAllAsReadAsync(
            businessId, userId, cancellationToken);

        return Ok(new MarkAllAsReadResponse { MarkedCount = count });
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Fetched {Count} notifications for user {UserId}")]
    private static partial void LogNotificationsFetched(ILogger logger, int count, Guid userId);
}

/// <summary>
/// Response for unread count endpoint.
/// </summary>
public record UnreadCountResponse
{
    /// <summary>
    /// Gets the unread notification count.
    /// </summary>
    public int Count { get; init; }
}

/// <summary>
/// Response for mark all as read endpoint.
/// </summary>
public record MarkAllAsReadResponse
{
    /// <summary>
    /// Gets the number of notifications marked as read.
    /// </summary>
    public int MarkedCount { get; init; }
}

