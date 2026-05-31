// -----------------------------------------------------------------------
// <copyright file="AIWorkflowController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for AI-powered workflow generation.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai/workflow")]
[Authorize]
[Produces("application/json")]
public class AIWorkflowController : ControllerBase
{
    private readonly IAIWorkflowGenerationService _workflowService;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<AIWorkflowController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIWorkflowController"/> class.
    /// </summary>
    public AIWorkflowController(
        IAIWorkflowGenerationService workflowService,
        ICurrentUserService currentUser,
        ILogger<AIWorkflowController> logger)
    {
        _workflowService = workflowService;
        _currentUser = currentUser;
        _logger = logger;
    }

    /// <summary>
    /// Generates a workflow definition using AI based on a natural language goal.
    /// </summary>
    /// <param name="request">The workflow generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated workflow definition.</returns>
    /// <response code="200">Workflow generated successfully.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="429">AI usage limit exceeded.</response>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(WorkflowGenerationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<WorkflowGenerationResult>> GenerateWorkflow(
        [FromBody] WorkflowGenerationRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Business context not found.",
                Status = StatusCodes.Status401Unauthorized,
            });
        }

        var result = await _workflowService.GenerateWorkflowAsync(
            businessId,
            request,
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
                {
                    Title = "Usage Limit Exceeded",
                    Detail = result.ErrorMessage,
                    Status = StatusCodes.Status429TooManyRequests,
                });
            }

            return BadRequest(new ProblemDetails
            {
                Title = "Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Saves a generated workflow to the business's workflow library.
    /// </summary>
    /// <param name="request">The workflow to save.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the saved workflow.</returns>
    /// <response code="201">Workflow saved successfully.</response>
    /// <response code="400">Invalid workflow data.</response>
    /// <response code="401">Unauthorized.</response>
    [HttpPost("save")]
    [ProducesResponseType(typeof(SaveWorkflowResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SaveWorkflowResponse>> SaveWorkflow(
        [FromBody] WorkflowGenerationResult request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var userId = _currentUser.GetUserId();

        if (businessId == Guid.Empty || !userId.HasValue || userId.Value == Guid.Empty)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "User context not found.",
                Status = StatusCodes.Status401Unauthorized,
            });
        }

        var workflowId = await _workflowService.SaveWorkflowAsync(
            businessId,
            request,
            userId.Value,
            cancellationToken);

        return CreatedAtAction(
            nameof(SaveWorkflow),
            new { id = workflowId },
            new SaveWorkflowResponse { WorkflowId = workflowId });
    }
}

/// <summary>
/// Response for saving a workflow.
/// </summary>
public sealed record SaveWorkflowResponse
{
    /// <summary>Gets the saved workflow ID.</summary>
    public Guid WorkflowId { get; init; }
}

