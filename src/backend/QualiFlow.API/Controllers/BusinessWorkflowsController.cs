using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;
using QualiFlow.Infrastructure.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for business users to manage their workflows.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/workflows")]
[Authorize]
public class BusinessWorkflowsController : ControllerBase
{
    private readonly IBusinessWorkflowService _businessWorkflowService;
    private readonly IWorkflowTemplateService _workflowTemplateService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<BusinessWorkflowsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BusinessWorkflowsController"/> class.
    /// </summary>
    /// <param name="businessWorkflowService">Business workflow service.</param>
    /// <param name="workflowTemplateService">Workflow template service.</param>
    /// <param name="currentUserService">Current user service.</param>
    /// <param name="logger">Logger instance.</param>
    public BusinessWorkflowsController(
        IBusinessWorkflowService businessWorkflowService,
        IWorkflowTemplateService workflowTemplateService,
        ICurrentUserService currentUserService,
        ILogger<BusinessWorkflowsController> logger)
    {
        _businessWorkflowService = businessWorkflowService;
        _workflowTemplateService = workflowTemplateService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all available workflow templates for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available workflow templates.</returns>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(IReadOnlyCollection<WorkflowTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<WorkflowTemplateDto>>> GetAvailableTemplates(
        CancellationToken cancellationToken)
    {
        try
        {
            // Get all active templates
            var templates = await _workflowTemplateService.GetTemplatesAsync(
                isActive: true,
                cancellationToken: cancellationToken);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available workflow templates");
            return StatusCode(500, "An error occurred while retrieving templates");
        }
    }

    /// <summary>
    /// Gets all workflows for the current business.
    /// </summary>
    /// <param name="isActive">Optional filter by active status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of business workflows.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<BusinessWorkflowDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<BusinessWorkflowDto>>> GetMyWorkflows(
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            if (businessId == Guid.Empty)
            {
                return BadRequest("Business ID not found");
            }

            var workflows = await _businessWorkflowService.GetBusinessWorkflowsAsync(
                businessId,
                isActive: isActive,
                cancellationToken: cancellationToken);

            return Ok(workflows);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving business workflows");
            return StatusCode(500, "An error occurred while retrieving workflows");
        }
    }

    /// <summary>
    /// Gets a specific workflow by ID.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Workflow details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BusinessWorkflowDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BusinessWorkflowDto>> GetWorkflowById(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(id, cancellationToken);

            if (workflow == null)
            {
                return NotFound($"Workflow {id} not found");
            }

            // Verify the workflow belongs to the current business
            var businessId = _currentUserService.GetBusinessId();
            if (workflow.BusinessId != businessId)
            {
                return Forbid();
            }

            return Ok(workflow);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow {WorkflowId}", id);
            return StatusCode(500, "An error occurred while retrieving the workflow");
        }
    }

    /// <summary>
    /// Activates a workflow template for the current business.
    /// </summary>
    /// <param name="request">Activation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Activated workflow.</returns>
    [HttpPost("activate")]
    [ProducesResponseType(typeof(BusinessWorkflowDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BusinessWorkflowDto>> ActivateWorkflow(
        [FromBody] ActivateWorkflowRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var businessId = _currentUserService.GetBusinessId();
            if (businessId == Guid.Empty)
            {
                return BadRequest("Business ID not found");
            }

            var workflow = await _businessWorkflowService.ActivateWorkflowAsync(
                businessId,
                request.TemplateId,
                request.CustomConfiguration,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetWorkflowById),
                new { id = workflow.Id },
                workflow);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to activate workflow");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating workflow");
            return StatusCode(500, "An error occurred while activating the workflow");
        }
    }

    /// <summary>
    /// Deactivates a workflow.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPut("{id}/deactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateWorkflow(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify workflow belongs to current business
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(id, cancellationToken);
            if (workflow == null)
            {
                return NotFound($"Workflow {id} not found");
            }

            var businessId = _currentUserService.GetBusinessId();
            if (workflow.BusinessId != businessId)
            {
                return Forbid();
            }

            var success = await _businessWorkflowService.DeactivateWorkflowAsync(id, cancellationToken);
            if (!success)
            {
                return NotFound($"Workflow {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating workflow {WorkflowId}", id);
            return StatusCode(500, "An error occurred while deactivating the workflow");
        }
    }

    /// <summary>
    /// Deletes a workflow.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWorkflow(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            // Verify workflow belongs to current business
            var workflow = await _businessWorkflowService.GetBusinessWorkflowByIdAsync(id, cancellationToken);
            if (workflow == null)
            {
                return NotFound($"Workflow {id} not found");
            }

            var businessId = _currentUserService.GetBusinessId();
            if (workflow.BusinessId != businessId)
            {
                return Forbid();
            }

            var success = await _businessWorkflowService.DeleteBusinessWorkflowAsync(id, cancellationToken);
            if (!success)
            {
                return NotFound($"Workflow {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting workflow {WorkflowId}", id);
            return StatusCode(500, "An error occurred while deleting the workflow");
        }
    }

    /// <summary>
    /// Gets workflow quota information for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Quota information.</returns>
    [HttpGet("quota")]
    [ProducesResponseType(typeof(WorkflowQuotaDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkflowQuotaDto>> GetQuota(
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            if (businessId == Guid.Empty)
            {
                return BadRequest("Business ID not found");
            }

            var quota = await _businessWorkflowService.GetWorkflowQuotaAsync(
                businessId,
                cancellationToken);

            return Ok(quota);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow quota");
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
