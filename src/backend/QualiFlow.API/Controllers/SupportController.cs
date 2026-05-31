// -----------------------------------------------------------------------
// <copyright file="SupportController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Support;
using QualiFlow.Application.Features.Support.DTOs;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Customer-facing controller for support tickets.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/support")]
[Authorize]
[Produces("application/json")]
public class SupportController : ControllerBase
{
    private readonly ISupportTicketService _ticketService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<SupportController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SupportController"/> class.
    /// </summary>
    public SupportController(
        ISupportTicketService ticketService,
        ICurrentUserService currentUserService,
        ILogger<SupportController> logger)
    {
        _ticketService = ticketService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new support ticket.
    /// </summary>
    /// <param name="request">Create ticket request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created ticket.</returns>
    [HttpPost("tickets")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SupportTicketDto>> CreateTicket(
        [FromBody] CreateTicketRequest request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.GetUserId();
        var businessId = _currentUserService.TryGetBusinessId();

        var ticket = await _ticketService.CreateTicketAsync(
            request,
            userId,
            businessId,
            cancellationToken);

        _logger.LogInformation(
            "Support ticket {TicketNumber} created by user {UserId}",
            ticket.TicketNumber,
            userId);

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    /// <summary>
    /// Gets the current user's tickets.
    /// </summary>
    /// <param name="query">Query parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paged list of tickets.</returns>
    [HttpGet("tickets")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(PagedResult<SupportTicketDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<SupportTicketDto>>> GetMyTickets(
        [FromQuery] TicketQuery query,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User ID not found");

        var result = await _ticketService.GetUserTicketsAsync(userId, query, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a specific ticket by ID (user must own the ticket).
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ticket.</returns>
    [HttpGet("tickets/{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(SupportTicketDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
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

        // Verify user owns this ticket or is in the same business
        var businessId = _currentUserService.TryGetBusinessId();
        if (ticket.BusinessId != businessId)
        {
            return Forbid();
        }

        return Ok(ticket);
    }

    /// <summary>
    /// Gets messages for a ticket (excludes internal notes).
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of messages.</returns>
    [HttpGet("tickets/{id:guid}/messages")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<TicketMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<TicketMessageDto>>> GetMessages(
        Guid id,
        CancellationToken cancellationToken)
    {
        // Verify access first
        var ticket = await _ticketService.GetTicketAsync(id, cancellationToken);
        if (ticket == null)
        {
            return NotFound();
        }

        var businessId = _currentUserService.TryGetBusinessId();
        if (ticket.BusinessId != businessId)
        {
            return Forbid();
        }

        // Get messages excluding internal notes
        var messages = await _ticketService.GetMessagesAsync(id, includeInternal: false, cancellationToken);
        return Ok(messages);
    }

    /// <summary>
    /// Adds a reply to a ticket.
    /// </summary>
    /// <param name="id">Ticket ID.</param>
    /// <param name="request">Message request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created message.</returns>
    [HttpPost("tickets/{id:guid}/messages")]
    [ProducesResponseType(typeof(TicketMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TicketMessageDto>> AddMessage(
        Guid id,
        [FromBody] AddTicketMessageRequest request,
        CancellationToken cancellationToken)
    {
        // Verify access first
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

        var businessId = _currentUserService.TryGetBusinessId();
        if (ticket.BusinessId != businessId)
        {
            return Forbid();
        }

        var userId = _currentUserService.GetUserId()
            ?? throw new UnauthorizedAccessException("User ID not found");

        // Customers cannot create internal notes
        var customerRequest = request with { IsInternal = false };

        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "User";
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "user@unknown.com";

        var message = await _ticketService.AddMessageAsync(
            id,
            customerRequest,
            senderUserId: userId,
            senderAdminId: null,
            userName,
            userEmail,
            cancellationToken);

        return CreatedAtAction(nameof(GetMessages), new { id }, message);
    }
}
