using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing workflow approval requests.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/workflow-approvals")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin")]
public class AdminWorkflowApprovalsController : ControllerBase
{
    private readonly IWorkflowApprovalService _approvalService;
    private readonly ILogger<AdminWorkflowApprovalsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminWorkflowApprovalsController"/> class.
    /// </summary>
    /// <param name="approvalService">Workflow approval service.</param>
    /// <param name="logger">Logger instance.</param>
    public AdminWorkflowApprovalsController(
        IWorkflowApprovalService approvalService,
        ILogger<AdminWorkflowApprovalsController> logger)
    {
        _approvalService = approvalService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all approval requests with optional filtering.
    /// </summary>
    /// <param name="businessId">Optional business ID filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of approval requests.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<WorkflowApprovalRequestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<WorkflowApprovalRequestDto>>> GetApprovalRequests(
        [FromQuery] Guid? businessId = null,
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var requests = await _approvalService.GetApprovalRequestsAsync(
                businessId,
                status,
                cancellationToken);

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving approval requests");
            return StatusCode(500, "An error occurred while retrieving approval requests");
        }
    }

    /// <summary>
    /// Gets a specific approval request by ID.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Approval request details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkflowApprovalRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowApprovalRequestDto>> GetApprovalRequestById(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var request = await _approvalService.GetApprovalRequestByIdAsync(id, cancellationToken);

            if (request == null)
            {
                return NotFound($"Approval request {id} not found");
            }

            return Ok(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving approval request {RequestId}", id);
            return StatusCode(500, "An error occurred while retrieving the approval request");
        }
    }

    /// <summary>
    /// Approves an approval request.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveRequest(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var success = await _approvalService.ApproveRequestAsync(
                id,
                userIdClaim.Value,
                cancellationToken);

            if (!success)
            {
                return NotFound($"Approval request {id} not found");
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to approve request {RequestId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving request {RequestId}", id);
            return StatusCode(500, "An error occurred while approving the request");
        }
    }

    /// <summary>
    /// Rejects an approval request.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="request">Rejection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectRequest(
        Guid id,
        [FromBody] RejectApprovalRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var success = await _approvalService.RejectRequestAsync(
                id,
                userIdClaim.Value,
                request.RejectionReason,
                cancellationToken);

            if (!success)
            {
                return NotFound($"Approval request {id} not found");
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to reject request {RequestId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting request {RequestId}", id);
            return StatusCode(500, "An error occurred while rejecting the request");
        }
    }
}

/// <summary>
/// Request model for rejecting an approval request.
/// </summary>
public class RejectApprovalRequest
{
    /// <summary>
    /// Gets or sets the rejection reason.
    /// </summary>
    public string? RejectionReason { get; set; }
}
