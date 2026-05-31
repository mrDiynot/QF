using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing business workflows.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/businesses/{businessId}/workflows")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin,SupportAdmin")]
public class AdminBusinessWorkflowsController : ControllerBase
{
    private readonly IBusinessWorkflowService _businessWorkflowService;
    private readonly ILogger<AdminBusinessWorkflowsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminBusinessWorkflowsController"/> class.
    /// </summary>
    /// <param name="businessWorkflowService">Business workflow service.</param>
    /// <param name="logger">Logger instance.</param>
    public AdminBusinessWorkflowsController(
        IBusinessWorkflowService businessWorkflowService,
        ILogger<AdminBusinessWorkflowsController> logger)
    {
        _businessWorkflowService = businessWorkflowService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all workflows for a specific business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="search">Optional search term.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of business workflows.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<BusinessWorkflowDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<BusinessWorkflowDto>>> GetBusinessWorkflows(
        Guid businessId,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var workflows = await _businessWorkflowService.GetBusinessWorkflowsAsync(
                businessId,
                search,
                isActive,
                cancellationToken);

            return Ok(workflows);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflows for business {BusinessId}", businessId);
            return StatusCode(500, "An error occurred while retrieving workflows");
        }
    }

    /// <summary>
    /// Gets a specific business workflow by ID.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="workflowId">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Business workflow details.</returns>
    [HttpGet("{workflowId}")]
    [ProducesResponseType(typeof(BusinessWorkflowDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BusinessWorkflowDto>> GetBusinessWorkflowById(
        Guid businessId,
        Guid workflowId,
        CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(
                workflowId,
                cancellationToken);

            if (workflow == null || workflow.BusinessId != businessId)
            {
                return NotFound($"Workflow {workflowId} not found for business {businessId}");
            }

            return Ok(workflow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow {WorkflowId} for business {BusinessId}",
                workflowId, businessId);
            return StatusCode(500, "An error occurred while retrieving the workflow");
        }
    }

    /// <summary>
    /// Activates a workflow template for a business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="request">Activation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Activated workflow.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BusinessWorkflowDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BusinessWorkflowDto>> ActivateWorkflow(
        Guid businessId,
        [FromBody] ActivateWorkflowRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var workflow = await _businessWorkflowService.ActivateWorkflowAsync(
                businessId,
                request.TemplateId,
                request.CustomConfiguration,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetBusinessWorkflowById),
                new { businessId, workflowId = workflow.Id },
                workflow);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to activate workflow for business {BusinessId}", businessId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating workflow for business {BusinessId}", businessId);
            return StatusCode(500, "An error occurred while activating the workflow");
        }
    }

    /// <summary>
    /// Deactivates a business workflow.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="workflowId">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPut("{workflowId}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateWorkflow(
        Guid businessId,
        Guid workflowId,
        CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(
                workflowId,
                cancellationToken);

            if (workflow == null || workflow.BusinessId != businessId)
            {
                return NotFound($"Workflow {workflowId} not found for business {businessId}");
            }

            await _businessWorkflowService.DeactivateWorkflowAsync(workflowId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Workflow {WorkflowId} not found", workflowId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating workflow {WorkflowId}", workflowId);
            return StatusCode(500, "An error occurred while deactivating the workflow");
        }
    }

    /// <summary>
    /// Deletes a business workflow (soft delete).
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="workflowId">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{workflowId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWorkflow(
        Guid businessId,
        Guid workflowId,
        CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(
                workflowId,
                cancellationToken);

            if (workflow == null || workflow.BusinessId != businessId)
            {
                return NotFound($"Workflow {workflowId} not found for business {businessId}");
            }

            await _businessWorkflowService.DeleteBusinessWorkflowAsync(workflowId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Workflow {WorkflowId} not found", workflowId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow {WorkflowId}", workflowId);
            return StatusCode(500, "An error occurred while deleting the workflow");
        }
    }

    /// <summary>
    /// Gets workflow quota information for a business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Workflow quota details.</returns>
    [HttpGet("quota")]
    [ProducesResponseType(typeof(WorkflowQuotaDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkflowQuotaDto>> GetWorkflowQuota(
        Guid businessId,
        CancellationToken cancellationToken)
    {
        try
        {
            var quota = await _businessWorkflowService.GetWorkflowQuotaAsync(
                businessId,
                cancellationToken);

            return Ok(quota);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business {BusinessId} not found", businessId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quota for business {BusinessId}", businessId);
            return StatusCode(500, "An error occurred while retrieving quota information");
        }
    }
}

/// <summary>
/// Request model for activating a workflow.
/// </summary>
public class ActivateWorkflowRequest
{
    /// <summary>
    /// Gets or sets the workflow template ID.
    /// </summary>
    public Guid TemplateId { get; set; }

    /// <summary>
    /// Gets or sets the custom configuration.
    /// </summary>
    public object? CustomConfiguration { get; set; }
}
