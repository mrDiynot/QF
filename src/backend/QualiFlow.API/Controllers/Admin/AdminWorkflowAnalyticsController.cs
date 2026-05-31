using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for workflow analytics.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/workflows/analytics")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin")]
public class AdminWorkflowAnalyticsController : ControllerBase
{
    private readonly IWorkflowTemplateService _workflowTemplateService;
    private readonly ILogger<AdminWorkflowAnalyticsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminWorkflowAnalyticsController"/> class.
    /// </summary>
    /// <param name="workflowTemplateService">Workflow template service.</param>
    /// <param name="logger">Logger instance.</param>
    public AdminWorkflowAnalyticsController(
        IWorkflowTemplateService workflowTemplateService,
        ILogger<AdminWorkflowAnalyticsController> logger)
    {
        _workflowTemplateService = workflowTemplateService;
        _logger = logger;
    }

    /// <summary>
    /// Gets platform-wide workflow analytics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Platform analytics.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(WorkflowAnalyticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkflowAnalyticsDto>> GetPlatformAnalytics(
        CancellationToken cancellationToken)
    {
        try
        {
            var analytics = await _workflowTemplateService.GetPlatformAnalyticsAsync(cancellationToken);
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving platform workflow analytics");
            return StatusCode(500, "An error occurred while retrieving analytics");
        }
    }

    /// <summary>
    /// Gets analytics for a specific workflow template.
    /// </summary>
    /// <param name="templateId">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Template analytics.</returns>
    [HttpGet("templates/{templateId}")]
    [ProducesResponseType(typeof(WorkflowAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowAnalyticsDto>> GetTemplateAnalytics(
        Guid templateId,
        CancellationToken cancellationToken)
    {
        try
        {
            var analytics = await _workflowTemplateService.GetTemplateAnalyticsAsync(
                templateId,
                cancellationToken);

            return Ok(analytics);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Template {TemplateId} not found", templateId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving analytics for template {TemplateId}", templateId);
            return StatusCode(500, "An error occurred while retrieving analytics");
        }
    }
}
