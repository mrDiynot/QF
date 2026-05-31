// -----------------------------------------------------------------------
// <copyright file="TeamMembersController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.TeamMembers.DTOs;
using QualiFlow.Application.Features.TeamMembers.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for team member management operations.
/// Enables business owners and admins to manage their team.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/team-members")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class TeamMembersController : ControllerBase
{
    private readonly ITeamMemberService _teamMemberService;
    private readonly IInvitationService _invitationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUsageLimitService _usageLimitService;
    private readonly ILogger<TeamMembersController> _logger;

    public TeamMembersController(
        ITeamMemberService teamMemberService,
        IInvitationService invitationService,
        ICurrentUserService currentUserService,
        IUsageLimitService usageLimitService,
        ILogger<TeamMembersController> logger)
    {
        _teamMemberService = teamMemberService;
        _invitationService = invitationService;
        _currentUserService = currentUserService;
        _usageLimitService = usageLimitService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all team members for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of team members.</returns>
    [HttpGet]
    [NoCache]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<TeamMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var members = await _teamMemberService.GetAllAsync(businessId, cancellationToken);
        return Ok(members);
    }

    /// <summary>
    /// Gets a specific team member by ID.
    /// </summary>
    /// <param name="id">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The team member.</returns>
    [HttpGet("{id:guid}")]
    [NoCache]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var member = await _teamMemberService.GetByIdAsync(businessId, id, cancellationToken);
        if (member == null)
        {
            return NotFound(new { message = $"Team member with ID {id} not found" });
        }

        return Ok(member);
    }

    /// <summary>
    /// Updates a team member's role.
    /// </summary>
    /// <param name="id">The user ID.</param>
    /// <param name="request">The role update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated team member.</returns>
    [HttpPatch("{id:guid}/role")]
    [Authorize(Policy = BusinessPolicies.RequireOwner)]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> UpdateRoleAsync(
        Guid id,
        [FromBody] UpdateTeamMemberRoleRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User ID not found");

        try
        {
            var member = await _teamMemberService.UpdateRoleAsync(businessId, id, request.Role, userId, cancellationToken);
            return Ok(member);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Removes a team member from the business.
    /// </summary>
    /// <param name="id">The user ID to remove.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User ID not found");

        try
        {
            await _teamMemberService.RemoveAsync(businessId, id, userId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Sends an invitation to join the business.
    /// </summary>
    /// <param name="request">The invitation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created invitation.</returns>
    /// <response code="201">Invitation sent successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="402">Team member (seat) limit reached.</response>
    [HttpPost("invitations")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status402PaymentRequired)]
    public async Task<ActionResult<InvitationDto>> InviteAsync(
        [FromBody] InviteTeamMemberRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User ID not found");

        // Check subscription limit for team members (seats)
        var canAdd = await _usageLimitService.CanAddTeamMemberAsync(businessId, cancellationToken);
        if (!canAdd)
        {
            return StatusCode(StatusCodes.Status402PaymentRequired, new ProblemDetails
            {
                Status = StatusCodes.Status402PaymentRequired,
                Title = "Team Member Limit Reached",
                Detail = "You have reached your subscription's team member (seat) limit. Please upgrade your plan to invite more team members.",
                Instance = HttpContext.Request.Path,
            });
        }

        try
        {
            var invitation = await _invitationService.InviteAsync(businessId, request, userId, cancellationToken);

            // Increment seat count when invitation is sent (will be decremented if invitation expires/cancelled)
            await _usageLimitService.IncrementSeatsAsync(businessId, cancellationToken);

            return CreatedAtAction(nameof(GetPendingInvitationsAsync), new { }, invitation);
        }
        catch (System.Security.SecurityException ex)
        {
            // Email domain restriction violation - security breach attempt
            return StatusCode(StatusCodes.Status403Forbidden, new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Email Domain Restriction",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path,
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Gets all pending invitations for the business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pending invitations.</returns>
    [HttpGet("invitations")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(IEnumerable<InvitationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<InvitationDto>>> GetPendingInvitationsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var invitations = await _invitationService.GetPendingInvitationsAsync(businessId, cancellationToken);
        return Ok(invitations);
    }

    /// <summary>
    /// Resends an invitation email.
    /// </summary>
    /// <param name="invitationId">The invitation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated invitation.</returns>
    [HttpPost("invitations/{invitationId:guid}/resend")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(typeof(InvitationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvitationDto>> ResendInvitationAsync(Guid invitationId, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        try
        {
            var invitation = await _invitationService.ResendAsync(businessId, invitationId, cancellationToken);
            return Ok(invitation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancels a pending invitation.
    /// </summary>
    /// <param name="invitationId">The invitation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("invitations/{invitationId:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelInvitationAsync(Guid invitationId, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        try
        {
            await _invitationService.CancelAsync(businessId, invitationId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
