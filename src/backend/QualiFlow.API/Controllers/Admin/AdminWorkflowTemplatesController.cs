using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing workflow templates.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/workflow-templates")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin")]
public class AdminWorkflowTemplatesController : ControllerBase
{
    private readonly IWorkflowTemplateService _workflowTemplateService;
    private readonly ILogger<AdminWorkflowTemplatesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminWorkflowTemplatesController"/> class.
    /// </summary>
    /// <param name="workflowTemplateService">Workflow template service.</param>
    /// <param name="logger">Logger instance.</param>
    public AdminWorkflowTemplatesController(
        IWorkflowTemplateService workflowTemplateService,
        ILogger<AdminWorkflowTemplatesController> logger)
    {
        _workflowTemplateService = workflowTemplateService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all workflow templates with optional filtering.
    /// </summary>
    /// <param name="search">Optional search term.</param>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of workflow templates.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<WorkflowTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<WorkflowTemplateDto>>> GetTemplates(
        [FromQuery] string? search = null,
        [FromQuery] string? category = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var templates = await _workflowTemplateService.GetTemplatesAsync(
                search,
                category,
                isActive,
                cancellationToken);

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow templates");
            return StatusCode(500, "An error occurred while retrieving workflow templates");
        }
    }

    /// <summary>
    /// Gets a workflow template by ID.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Workflow template details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(WorkflowTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowTemplateDto>> GetTemplateById(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var template = await _workflowTemplateService.GetTemplateByIdAsync(id, cancellationToken);

            if (template == null)
            {
                return NotFound($"Template {id} not found");
            }

            return Ok(template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving template {TemplateId}", id);
            return StatusCode(500, "An error occurred while retrieving the template");
        }
    }

    /// <summary>
    /// Creates a new workflow template.
    /// </summary>
    /// <param name="request">Template creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created workflow template.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(WorkflowTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowTemplateDto>> CreateTemplate(
        [FromBody] CreateWorkflowTemplateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current admin user ID from claims
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var template = await _workflowTemplateService.CreateTemplateAsync(
                request,
                userIdClaim.Value,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetTemplateById),
                new { id = template.Id },
                template);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating workflow template");
            return StatusCode(500, "An error occurred while creating the template");
        }
    }

    /// <summary>
    /// Updates an existing workflow template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="request">Template update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated workflow template.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WorkflowTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowTemplateDto>> UpdateTemplate(
        Guid id,
        [FromBody] UpdateWorkflowTemplateRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var template = await _workflowTemplateService.UpdateTemplateAsync(
                id,
                request,
                cancellationToken);

            return Ok(template);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating template {TemplateId}", id);
            return StatusCode(500, "An error occurred while updating the template");
        }
    }

    /// <summary>
    /// Deletes a workflow template (soft delete).
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            await _workflowTemplateService.DeleteTemplateAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting template {TemplateId}", id);
            return StatusCode(500, "An error occurred while deleting the template");
        }
    }

    /// <summary>
    /// Gets analytics for a specific workflow template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Template analytics.</returns>
    [HttpGet("{id}/analytics")]
    [ProducesResponseType(typeof(WorkflowAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowAnalyticsDto>> GetTemplateAnalytics(
        Guid id,
        CancellationToken cancellationToken)
    {
        try
        {
            var analytics = await _workflowTemplateService.GetTemplateAnalyticsAsync(
                id,
                cancellationToken);

            return Ok(analytics);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving analytics for template {TemplateId}", id);
            return StatusCode(500, "An error occurred while retrieving analytics");
        }
    }
}
