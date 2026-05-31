// -----------------------------------------------------------------------
// <copyright file="AdminPlansController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.Billing;
using QualiFlow.Application.Features.Admin.Billing.DTOs;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for managing subscription plans.
/// Provides CRUD operations and CMS sync for billing tables.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/plans")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminPlansController : ControllerBase
{
    private readonly IAdminPlanManagementService _planService;
    private readonly ILogger<AdminPlansController> _logger;

    /// <summary>Initializes a new instance of the <see cref="AdminPlansController"/> class.</summary>
    public AdminPlansController(IAdminPlanManagementService planService, ILogger<AdminPlansController> logger)
    {
        _planService = planService;
        _logger = logger;
    }

    /// <summary>Gets all subscription plans.</summary>
    /// <returns>A list of all subscription plans.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminPlanDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlans([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var plans = await _planService.GetAllPlansAsync(includeInactive, cancellationToken);
        return Ok(plans);
    }

    /// <summary>Gets a subscription plan by ID.</summary>
    /// <returns>The subscription plan if found.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPlan(Guid id, CancellationToken cancellationToken)
    {
        var plan = await _planService.GetPlanByIdAsync(id, cancellationToken);
        return plan == null ? NotFound() : Ok(plan);
    }

    /// <summary>Creates a new subscription plan.</summary>
    /// <returns>The created subscription plan.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AdminPlanDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreatePlan([FromBody] AdminPlanRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin creating subscription plan {PlanName}", request.Name);
        var plan = await _planService.CreatePlanAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetPlan), new { id = plan.Id }, plan);
    }

    /// <summary>Updates an existing subscription plan.</summary>
    /// <returns>The updated subscription plan.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] AdminPlanRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin updating subscription plan {PlanId}", id);
        var plan = await _planService.UpdatePlanAsync(id, request, cancellationToken);
        return plan == null ? NotFound() : Ok(plan);
    }

    /// <summary>Toggles a plan's active or public status.</summary>
    /// <returns>The updated plan.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(AdminPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TogglePlanStatus(Guid id, [FromBody] TogglePlanStatusRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin toggling plan {PlanId} status", id);
        var plan = await _planService.TogglePlanStatusAsync(id, request.IsActive, request.IsPublic, cancellationToken);
        return plan == null ? NotFound() : Ok(plan);
    }

    /// <summary>Deletes (deactivates) a subscription plan.</summary>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePlan(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogWarning("Admin deleting subscription plan {PlanId}", id);
        var result = await _planService.DeletePlanAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }

    /// <summary>Syncs all subscription plans to CMS pricing plans.</summary>
    /// <returns>The number of plans synced.</returns>
    [HttpPost("sync-to-cms")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncToCms(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin syncing all plans to CMS");
        var count = await _planService.SyncAllPlansToCmsAsync(cancellationToken);
        return Ok(new { message = $"Synced {count} plans to CMS", syncedCount = count });
    }

    /// <summary>Validates CMS and billing data consistency.</summary>
    /// <returns>The validation result.</returns>
    [HttpGet("validate-cms-consistency")]
    [ProducesResponseType(typeof(CmsBillingValidationResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ValidateCmsConsistency(CancellationToken cancellationToken)
    {
        var result = await _planService.ValidateCmsBillingConsistencyAsync(cancellationToken);
        return Ok(result);
    }
}

/// <summary>
/// Request to toggle a plan's status.
/// </summary>
public class TogglePlanStatusRequest
{
    /// <summary>Gets or sets the new active status (null to leave unchanged).</summary>
    public bool? IsActive { get; set; }

    /// <summary>Gets or sets the new public status (null to leave unchanged).</summary>
    public bool? IsPublic { get; set; }
}