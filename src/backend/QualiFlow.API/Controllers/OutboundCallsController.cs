// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.OutboundCalls.DTOs;
using QualiFlow.Application.Features.OutboundCalls.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for outbound call operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/outbound-calls")]
[Authorize]
[Produces("application/json")]
public class OutboundCallsController : ControllerBase
{
    private readonly IOutboundCallService _callService;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="OutboundCallsController"/> class.
    /// </summary>
    public OutboundCallsController(
        IOutboundCallService callService,
        ICurrentUserService currentUser)
    {
        _callService = callService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Initiates an outbound call to a lead.
    /// </summary>
    /// <param name="request">The call request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The initiated call.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(OutboundCallDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OutboundCallDto>> InitiateCall(
        [FromBody] InitiateOutboundCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var call = await _callService.InitiateCallAsync(businessId, request, cancellationToken);
        return CreatedAtAction(nameof(GetCall), new { id = call.Id }, call);
    }

    /// <summary>
    /// Schedules a follow-up call.
    /// </summary>
    /// <param name="request">The schedule request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scheduled call.</returns>
    [HttpPost("schedule")]
    [ProducesResponseType(typeof(OutboundCallDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OutboundCallDto>> ScheduleFollowUpCall(
        [FromBody] ScheduleFollowUpCallRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var call = await _callService.ScheduleFollowUpCallAsync(businessId, request, cancellationToken);
        return CreatedAtAction(nameof(GetCall), new { id = call.Id }, call);
    }

    /// <summary>
    /// Gets an outbound call by ID.
    /// </summary>
    /// <param name="id">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The call details.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OutboundCallDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OutboundCallDto>> GetCall(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var call = await _callService.GetCallAsync(businessId, id, cancellationToken);

        if (call == null)
        {
            return NotFound();
        }

        return Ok(call);
    }

    /// <summary>
    /// Gets a list of outbound calls.
    /// </summary>
    /// <param name="query">Query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paged list of calls.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Models.PagedResult<OutboundCallDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<Application.Common.Models.PagedResult<OutboundCallDto>>> GetCalls(
        [FromQuery] OutboundCallListQuery query,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var calls = await _callService.GetCallsAsync(businessId, query, cancellationToken);
        return Ok(calls);
    }

    /// <summary>
    /// Hangs up an active call.
    /// </summary>
    /// <param name="id">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpPost("{id:guid}/hangup")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> HangupCall(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var success = await _callService.HangupCallAsync(businessId, id, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Cancels a scheduled call.
    /// </summary>
    /// <param name="id">The call ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelScheduledCall(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var success = await _callService.CancelScheduledCallAsync(businessId, id, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Gets call statistics for the business.
    /// </summary>
    /// <param name="fromDate">Start date.</param>
    /// <param name="toDate">End date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Call statistics.</returns>
    [HttpGet("statistics")]
    [ProducesResponseType(typeof(Application.Common.Interfaces.OutboundCallStatistics), StatusCodes.Status200OK)]
    public async Task<ActionResult<Application.Common.Interfaces.OutboundCallStatistics>> GetStatistics(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var from = fromDate ?? DateTime.UtcNow.AddDays(-30);
        var to = toDate ?? DateTime.UtcNow;
        var stats = await _callService.GetStatisticsAsync(businessId, from, to, cancellationToken);
        return Ok(stats);
    }
}
