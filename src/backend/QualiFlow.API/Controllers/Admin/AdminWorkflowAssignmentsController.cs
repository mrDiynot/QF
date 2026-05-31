using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing workflow plan assignments.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/workflow-plan-assignments")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin")]
public class AdminWorkflowAssignmentsController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<AdminWorkflowAssignmentsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminWorkflowAssignmentsController"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="logger">Logger instance.</param>
    public AdminWorkflowAssignmentsController(
        QualiFlowDbContext context,
        ILogger<AdminWorkflowAssignmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Gets all workflow plan assignments.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of plan assignments grouped by template.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignments(CancellationToken cancellationToken)
    {
        try
        {
            var assignments = await _context.WorkflowPlanAssignments
                .Include(a => a.WorkflowTemplate)
                .Where(a => a.WorkflowTemplate.DeletedAt == null)
                .OrderBy(a => a.WorkflowTemplate.Name)
                .ThenBy(a => a.PlanTier)
                .Select(a => new
                {
                    a.Id,
                    a.WorkflowTemplateId,
                    TemplateName = a.WorkflowTemplate.Name,
                    TemplateCategory = a.WorkflowTemplate.Category,
                    PlanTier = a.PlanTier,
                    PlanTierName = a.PlanTier.ToString(),
                    a.IsIncluded,
                    a.RequiresApproval,
                    a.MaxInstances,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync(cancellationToken);

            return Ok(assignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow plan assignments");
            return StatusCode(500, "An error occurred while retrieving assignments");
        }
    }

    /// <summary>
    /// Updates workflow plan assignments for a specific template.
    /// </summary>
    /// <param name="request">Assignment update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated assignments.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateAssignments(
        [FromBody] UpdateAssignmentsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var template = await _context.WorkflowTemplates
                .Include(t => t.PlanAssignments)
                .FirstOrDefaultAsync(t => t.Id == request.TemplateId, cancellationToken);

            if (template == null)
            {
                return NotFound($"Template {request.TemplateId} not found");
            }

            // Get current admin user ID
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            // Remove existing assignments
            _context.WorkflowPlanAssignments.RemoveRange(template.PlanAssignments);

            // Add new assignments
            foreach (var tierName in request.SubscriptionTiers)
            {
                if (Enum.TryParse<SubscriptionTier>(tierName, true, out var tier))
                {
                    var assignment = new Domain.Entities.WorkflowPlanAssignment
                    {
                        WorkflowTemplateId = request.TemplateId,
                        PlanTier = tier,
                        IsIncluded = true,
                        RequiresApproval = request.RequiresApproval,
                        MaxInstances = request.MaxInstances,
                        AssignedBy = userIdClaim.Value
                    };
                    _context.WorkflowPlanAssignments.Add(assignment);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            var updatedAssignments = await _context.WorkflowPlanAssignments
                .Where(a => a.WorkflowTemplateId == request.TemplateId)
                .Select(a => new
                {
                    a.Id,
                    a.WorkflowTemplateId,
                    a.PlanTier,
                    PlanTierName = a.PlanTier.ToString(),
                    a.IsIncluded,
                    a.RequiresApproval,
                    a.MaxInstances
                })
                .ToListAsync(cancellationToken);

            return Ok(updatedAssignments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating workflow plan assignments");
            return StatusCode(500, "An error occurred while updating assignments");
        }
    }

    /// <summary>
    /// Bulk updates workflow plan assignments for multiple templates.
    /// </summary>
    /// <param name="requests">List of assignment update requests.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success status.</returns>
    [HttpPost("bulk")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkUpdateAssignments(
        [FromBody] ICollection<UpdateAssignmentsRequest> requests,
        CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("userId");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }

            foreach (var request in requests)
            {
                var template = await _context.WorkflowTemplates
                    .Include(t => t.PlanAssignments)
                    .FirstOrDefaultAsync(t => t.Id == request.TemplateId, cancellationToken);

                if (template == null)
                {
                    continue;
                }

                _context.WorkflowPlanAssignments.RemoveRange(template.PlanAssignments);

                foreach (var tierName in request.SubscriptionTiers)
                {
                    if (Enum.TryParse<SubscriptionTier>(tierName, true, out var tier))
                    {
                        var assignment = new Domain.Entities.WorkflowPlanAssignment
                        {
                            WorkflowTemplateId = request.TemplateId,
                            PlanTier = tier,
                            IsIncluded = true,
                            RequiresApproval = request.RequiresApproval,
                            MaxInstances = request.MaxInstances,
                            AssignedBy = userIdClaim.Value
                        };
                        _context.WorkflowPlanAssignments.Add(assignment);
                    }
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            return Ok(new { message = "Bulk assignments updated successfully", count = requests.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk update of workflow plan assignments");
            return StatusCode(500, "An error occurred while performing bulk update");
        }
    }
}

/// <summary>
/// Request model for updating workflow plan assignments.
/// </summary>
public class UpdateAssignmentsRequest
{
    /// <summary>
    /// Gets or sets the workflow template ID.
    /// </summary>
    public Guid TemplateId { get; set; }

    /// <summary>
    /// Gets the subscription tiers to assign.
    /// </summary>
    public ICollection<string> SubscriptionTiers { get; init; } = [];

    /// <summary>
    /// Gets or sets a value indicating whether approval is required.
    /// </summary>
    public bool RequiresApproval { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of instances allowed.
    /// </summary>
    public int? MaxInstances { get; set; }
}
