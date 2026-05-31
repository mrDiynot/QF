// <copyright file="CalendarIntegrationsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Integrations.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for calendar integrations (Google Calendar, etc.).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/calendar-integrations")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class CalendarIntegrationsController : ControllerBase
{
    private readonly IGoogleCalendarService _googleCalendarService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="CalendarIntegrationsController"/> class.
    /// </summary>
    public CalendarIntegrationsController(
        IGoogleCalendarService googleCalendarService,
        ICurrentUserService currentUserService)
    {
        _googleCalendarService = googleCalendarService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets the current Google Calendar integration for the user.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Integration details or null.</returns>
    [HttpGet("google")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(CalendarIntegrationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CalendarIntegrationDto>> GetGoogleIntegrationAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var integration = await _googleCalendarService.GetIntegrationAsync(businessId, userId.GetValueOrDefault(), cancellationToken);

        if (integration == null)
        {
            return NotFound();
        }

        return Ok(integration);
    }

    /// <summary>
    /// Initiates the Google Calendar OAuth flow.
    /// </summary>
    /// <param name="redirectUri">The redirect URI after authorization.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Authorization URL.</returns>
    [HttpPost("google/connect")]
    [ProducesResponseType(StatusCodes.Status200OK)]
#pragma warning disable CA1054 // URI parameters should not be strings - OAuth redirectUri comes from frontend as string
    public async Task<IActionResult> InitiateGoogleOAuthAsync(
        [FromQuery] string redirectUri,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

#pragma warning restore CA1054
        var authUrl = await _googleCalendarService.InitiateOAuthAsync(
            businessId, userId.GetValueOrDefault(), redirectUri, cancellationToken);

        return Ok(new { authorizationUrl = authUrl });
    }

    /// <summary>
    /// Handles the OAuth callback from Google.
    /// </summary>
    /// <param name="code">Authorization code.</param>
    /// <param name="redirectUri">The redirect URI used in the initial request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Integration details.</returns>
    [HttpPost("google/callback")]
    [ProducesResponseType(typeof(CalendarIntegrationDto), StatusCodes.Status200OK)]
#pragma warning disable CA1054
    public async Task<ActionResult<CalendarIntegrationDto>> HandleGoogleCallbackAsync(
        [FromQuery] string code,
        [FromQuery] string redirectUri,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

#pragma warning restore CA1054
        var integration = await _googleCalendarService.HandleCallbackAsync(
            businessId, userId.GetValueOrDefault(), code, redirectUri, cancellationToken);

        return Ok(integration);
    }

    /// <summary>
    /// Disconnects the Google Calendar integration.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("google")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DisconnectGoogleAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var success = await _googleCalendarService.DisconnectAsync(businessId, userId.GetValueOrDefault(), cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Gets available calendars from Google Calendar.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of calendars.</returns>
    [HttpGet("google/calendars")]
    [ProducesResponseType(typeof(IEnumerable<CalendarDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CalendarDto>>> GetGoogleCalendarsAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var calendars = await _googleCalendarService.GetCalendarsAsync(businessId, userId.GetValueOrDefault(), cancellationToken);

        return Ok(calendars);
    }

    /// <summary>
    /// Updates Google Calendar sync settings.
    /// </summary>
    /// <param name="request">Update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated integration.</returns>
    [HttpPut("google/settings")]
    [ProducesResponseType(typeof(CalendarIntegrationDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<CalendarIntegrationDto>> UpdateGoogleSettingsAsync(
        [FromBody] UpdateCalendarSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var integration = await _googleCalendarService.UpdateSettingsAsync(
            businessId, userId.GetValueOrDefault(), request, cancellationToken);

        return Ok(integration);
    }

    /// <summary>
    /// Gets busy times from Google Calendar.
    /// </summary>
    /// <param name="startTime">Start of the time range.</param>
    /// <param name="endTime">End of the time range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of busy time slots.</returns>
    [HttpGet("google/busy-times")]
    [ProducesResponseType(typeof(IEnumerable<BusyTimeSlot>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BusyTimeSlot>>> GetBusyTimesAsync(
        [FromQuery] DateTime startTime,
        [FromQuery] DateTime endTime,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var busyTimes = await _googleCalendarService.GetBusyTimesAsync(
            businessId, userId.GetValueOrDefault(), startTime, endTime, cancellationToken);

        return Ok(busyTimes);
    }

    /// <summary>
    /// Creates an event on Google Calendar.
    /// </summary>
    /// <param name="request">Event creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created event ID.</returns>
    [HttpPost("google/events")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateEventAsync(
        [FromBody] CreateCalendarEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var eventId = await _googleCalendarService.CreateEventAsync(
            businessId, userId.GetValueOrDefault(), request, cancellationToken);

        return CreatedAtAction(nameof(GetGoogleIntegrationAsync), new { eventId });
    }
}
