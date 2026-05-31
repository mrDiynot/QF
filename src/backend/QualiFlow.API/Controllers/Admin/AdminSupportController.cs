// -----------------------------------------------------------------------
// <copyright file="AdminSupportController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Support;
using QualiFlow.Application.Features.Support.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing support tickets.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/support")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequireSupportAdmin)]
[Produces("application/json")]
public class AdminSupportController : ControllerBase
{
    private readonly ISupportTicketService _ticketService;
    private readonly ILogger<AdminSupportController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminSupportController"/> class.
    /// </summary>
    public AdminSupportController(
        ISupportTicketService ticketService,
        ILogger<AdminSupportController> logger)
    {
        _ticketService = ticketService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all support tickets with pagination and filtering.
    /// </summary>
    /// <param name="query">Query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paged list of tickets.</returns>
    [HttpGet("tickets")]
    [ProducesResponseType(typeof(PagedResult<SupportTicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SupportTicketDto>>> GetTickets(
        [FromQuery] TicketQuery query,
        CancellationToken cancellationToken)
    {
        var result = await _ticketService.GetTicketsAsync(query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific ticket by ID.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ticket.</returns>
    [HttpGet("tickets/{id:guid}")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDto>> GetTicket(
        Guid id,
        CancellationToken cancellationToken)
    {
        var ticket = await _ticketService.GetTicketAsync(id, cancellationToken);

        if (ticket == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Ticket {id} not found",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(ticket);
    }

    /// <summary>
    /// Gets a ticket by ticket number.
    /// </summary>
    /// <param name="ticketNumber">Ticket number.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ticket.</returns>
    [HttpGet("tickets/by-number/{ticketNumber}")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDto>> GetTicketByNumber(
        string ticketNumber,
        CancellationToken cancellationToken)
    {
        var ticket = await _ticketService.GetTicketByNumberAsync(ticketNumber, cancellationToken);

        if (ticket == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = $"Ticket {ticketNumber} not found",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(ticket);
    }

    /// <summary>
    /// Gets messages for a ticket (includes internal notes).
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of messages.</returns>
    [HttpGet("tickets/{id:guid}/messages")]
    [ProducesResponseType(typeof(IReadOnlyList<TicketMessageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TicketMessageDto>>> GetMessages(
        Guid id,
        CancellationToken cancellationToken)
    {
        var messages = await _ticketService.GetMessagesAsync(id, includeInternal: true, cancellationToken);
        return Ok(messages);
    }

    /// <summary>
    /// Adds a message or internal note to a ticket.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="request">Message request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created message.</returns>
    [HttpPost("tickets/{id:guid}/messages")]
    [ProducesResponseType(typeof(TicketMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketMessageDto>> AddMessage(
        Guid id,
        [FromBody] AddTicketMessageRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var (adminName, adminEmail) = GetCurrentAdminInfo();

        try
        {
            var message = await _ticketService.AddMessageAsync(
                id,
                request,
                senderUserId: null,
                senderAdminId: adminId,
                adminName,
                adminEmail,
                cancellationToken);

            return CreatedAtAction(nameof(GetMessages), new { id }, message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Updates ticket status.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="request">Status update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    [HttpPatch("tickets/{id:guid}/status")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateTicketStatusRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var (adminName, _) = GetCurrentAdminInfo();

        try
        {
            var ticket = await _ticketService.UpdateStatusAsync(
                id,
                request,
                adminId,
                adminName,
                cancellationToken);

            return Ok(ticket);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Assigns a ticket to an admin.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="request">Assign request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    [HttpPatch("tickets/{id:guid}/assign")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDto>> AssignTicket(
        Guid id,
        [FromBody] AssignTicketRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();

        try
        {
            var ticket = await _ticketService.AssignTicketAsync(
                id,
                request,
                adminId,
                cancellationToken);

            return Ok(ticket);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Updates ticket priority.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="request">Priority update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    [HttpPatch("tickets/{id:guid}/priority")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupportTicketDto>> UpdatePriority(
        Guid id,
        [FromBody] UpdateTicketPriorityRequest request,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();
        var (adminName, _) = GetCurrentAdminInfo();

        try
        {
            var ticket = await _ticketService.UpdatePriorityAsync(
                id,
                request,
                adminId,
                adminName,
                cancellationToken);

            return Ok(ticket);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Not Found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }

    /// <summary>
    /// Gets dashboard statistics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dashboard statistics.</returns>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(TicketDashboardStats), StatusCodes.Status200OK)]
    public async Task<ActionResult<TicketDashboardStats>> GetDashboardStats(
        CancellationToken cancellationToken)
    {
        var stats = await _ticketService.GetDashboardStatsAsync(cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Checks for SLA breaches and updates tickets accordingly.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of tickets marked as breached.</returns>
    [HttpPost("sla/check")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckSlaBreaches(CancellationToken cancellationToken)
    {
        var breachedCount = await _ticketService.CheckSlaBreachesAsync(cancellationToken);

        _logger.LogInformation("SLA breach check completed. {BreachedCount} tickets breached", breachedCount);

        return Ok(new { breachedCount });
    }

    /// <summary>
    /// Gets tickets assigned to the current admin user.
    /// </summary>
    /// <param name="query">Query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paged list of assigned tickets.</returns>
    [HttpGet("my-tickets")]
    [ProducesResponseType(typeof(PagedResult<SupportTicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SupportTicketDto>>> GetMyAssignedTickets(
        [FromQuery] TicketQuery query,
        CancellationToken cancellationToken)
    {
        var adminId = GetCurrentAdminId();

        // Override the query to filter by the current admin's assigned tickets
        var filteredQuery = query with { AssignedToAdminId = adminId };

        var result = await _ticketService.GetTicketsAsync(filteredQuery, cancellationToken);
        return Ok(result);
    }

    private Guid GetCurrentAdminId()
    {
        var adminIdClaim = User.FindFirst("admin_id")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(adminIdClaim) || !Guid.TryParse(adminIdClaim, out var adminId))
        {
            throw new UnauthorizedAccessException("Admin ID not found in token");
        }

        return adminId;
    }

    private (string name, string email) GetCurrentAdminInfo()
    {
        var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
        var email = User.FindFirst(ClaimTypes.Email)?.Value ?? "admin@qualiflow.ai";
        return (name, email);
    }
}
