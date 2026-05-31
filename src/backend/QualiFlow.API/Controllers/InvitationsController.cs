// -----------------------------------------------------------------------
// <copyright file="InvitationsController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.TeamMembers.DTOs;
using QualiFlow.Application.Features.TeamMembers.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Public controller for invitation acceptance operations.
/// These endpoints do not require authentication as they are used by invitees
/// who don't have accounts yet.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/invitations")]
[AllowAnonymous]
[Produces("application/json")]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _invitationService;
    private readonly ILogger<InvitationsController> _logger;

    public InvitationsController(
        IInvitationService invitationService,
        ILogger<InvitationsController> logger)
    {
        _invitationService = invitationService;
        _logger = logger;
    }

    /// <summary>
    /// Gets invitation details by token.
    /// Used to display invitation info before acceptance.
    /// </summary>
    /// <param name="token">The invitation token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The invitation details.</returns>
    [HttpGet("{token}")]
    [NoCache]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<ActionResult<InvitationDto>> GetByTokenAsync(string token, CancellationToken cancellationToken)
    {
        var invitation = await _invitationService.GetByTokenAsync(token, cancellationToken);

        if (invitation == null)
        {
            return NotFound(new { message = "Invitation not found" });
        }

        if (!invitation.IsValid)
        {
            return StatusCode(StatusCodes.Status410Gone, new { message = $"Invitation is no longer valid. Status: {invitation.Status}" });
        }

        return Ok(invitation);
    }

    /// <summary>
    /// Accepts an invitation and creates a user account.
    /// </summary>
    /// <param name="request">The acceptance request with user details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The acceptance response with user and business info.</returns>
    [HttpPost("accept")]
    [ProducesResponseType(typeof(AcceptInvitationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status410Gone)]
    public async Task<ActionResult<AcceptInvitationResponse>> AcceptAsync(
        [FromBody] AcceptInvitationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _invitationService.AcceptAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("no longer valid", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status410Gone, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

