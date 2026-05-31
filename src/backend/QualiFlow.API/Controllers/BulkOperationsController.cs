// <copyright file="BulkOperationsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.BulkOperations.DTOs;
using QualiFlow.Application.Features.BulkOperations.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for bulk operations on entities.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class BulkOperationsController(
    IBulkOperationsService bulkOperationsService,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Performs bulk update on leads.
    /// </summary>
    /// <param name="request">The bulk update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    /// <response code="200">Bulk update completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("leads/update")]
    [ProducesResponseType(typeof(BulkOperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BulkOperationResult>> BulkUpdateLeads(
        [FromBody] BulkUpdateLeadsRequest request,
        CancellationToken cancellationToken)
    {
        if (request.LeadIds.Count == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = "At least one lead ID must be provided.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var result = await bulkOperationsService.BulkUpdateLeadsAsync(businessId, request, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Performs bulk delete on leads.
    /// </summary>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    /// <response code="200">Bulk delete completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("leads/delete")]
    [ProducesResponseType(typeof(BulkOperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BulkOperationResult>> BulkDeleteLeads(
        [FromBody] BulkDeleteRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EntityIds.Count == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = "At least one entity ID must be provided.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var result = await bulkOperationsService.BulkDeleteLeadsAsync(businessId, request, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Performs bulk delete on conversations.
    /// </summary>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    /// <response code="200">Bulk delete completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("conversations/delete")]
    [ProducesResponseType(typeof(BulkOperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BulkOperationResult>> BulkDeleteConversations(
        [FromBody] BulkDeleteRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EntityIds.Count == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = "At least one entity ID must be provided.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var result = await bulkOperationsService.BulkDeleteConversationsAsync(businessId, request, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Performs bulk delete on contacts.
    /// </summary>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    /// <response code="200">Bulk delete completed successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("contacts/delete")]
    [ProducesResponseType(typeof(BulkOperationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BulkOperationResult>> BulkDeleteContacts(
        [FromBody] BulkDeleteRequest request,
        CancellationToken cancellationToken)
    {
        if (request.EntityIds.Count == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Request",
                Detail = "At least one entity ID must be provided.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var result = await bulkOperationsService.BulkDeleteContactsAsync(businessId, request, cancellationToken);

        return Ok(result);
    }
}

