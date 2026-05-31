// -----------------------------------------------------------------------
// <copyright file="NotificationPreferencesController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Notifications.DTOs;
using QualiFlow.Application.Features.Notifications.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing user notification preferences.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/notification-preferences")]
[Authorize]
[Produces("application/json")]
public class NotificationPreferencesController : ControllerBase
{
    private readonly INotificationPreferenceService _preferenceService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationPreferencesController"/> class.
    /// </summary>
    public NotificationPreferencesController(
        INotificationPreferenceService preferenceService,
        ICurrentUserService currentUserService)
    {
        _preferenceService = preferenceService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets the current user's notification preferences.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user's notification preferences.</returns>
    /// <response code="200">Notification preferences retrieved successfully.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpGet]
    [ProducesResponseType(typeof(NotificationPreferenceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationPreferenceDto>> GetPreferences(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var preferences = await _preferenceService.GetPreferencesAsync(
            businessId,
            userId.Value,
            cancellationToken);

        return Ok(preferences);
    }

    /// <summary>
    /// Updates the current user's notification preferences.
    /// </summary>
    /// <param name="request">The preferences to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated notification preferences.</returns>
    /// <response code="200">Preferences updated successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpPut]
    [ProducesResponseType(typeof(NotificationPreferenceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationPreferenceDto>> UpdatePreferences(
        [FromBody] UpdateNotificationPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var preferences = await _preferenceService.UpdatePreferencesAsync(
            businessId,
            userId.Value,
            request,
            cancellationToken);

        return Ok(preferences);
    }

    /// <summary>
    /// Partially updates the current user's notification preferences.
    /// </summary>
    /// <param name="request">The preferences to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated notification preferences.</returns>
    /// <response code="200">Preferences updated successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpPatch]
    [ProducesResponseType(typeof(NotificationPreferenceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NotificationPreferenceDto>> PatchPreferences(
        [FromBody] UpdateNotificationPreferencesRequest request,
        CancellationToken cancellationToken)
    {
        // PATCH uses the same logic as PUT since UpdatePreferencesAsync
        // only updates provided fields
        return await UpdatePreferences(request, cancellationToken);
    }
}

