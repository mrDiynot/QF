// -----------------------------------------------------------------------
// <copyright file="AdminPlanLimitsController.cs" company="QualiFlow">
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
/// Admin controller for managing plan limits.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/plan-limits")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminPlanLimitsController : ControllerBase
{
    private readonly IAdminPlanManagementService _planService;
    private readonly ILogger<AdminPlanLimitsController> _logger;

    /// <summary>Initializes a new instance of the <see cref="AdminPlanLimitsController"/> class.</summary>
    public AdminPlanLimitsController(IAdminPlanManagementService planService, ILogger<AdminPlanLimitsController> logger)
    {
        _planService = planService;
        _logger = logger;
    }

    /// <summary>Gets all plan limits, optionally filtered by plan ID.</summary>
    /// <returns>A list of plan limits.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminPlanLimitDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlanLimits([FromQuery] Guid? planId = null, CancellationToken cancellationToken = default)
    {
        var limits = await _planService.GetAllPlanLimitsAsync(planId, cancellationToken);
        return Ok(limits);
    }

    /// <summary>Gets a plan limit by ID.</summary>
    /// <returns>The plan limit if found.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminPlanLimitDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPlanLimit(Guid id, CancellationToken cancellationToken)
    {
        var limit = await _planService.GetPlanLimitByIdAsync(id, cancellationToken);
        return limit == null ? NotFound() : Ok(limit);
    }

    /// <summary>Creates or updates a plan limit (upsert by plan + limit key).</summary>
    /// <returns>The created or updated plan limit.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AdminPlanLimitDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpsertPlanLimit([FromBody] AdminPlanLimitRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin upserting plan limit {LimitKey} for plan {PlanId}", request.LimitKey, request.PlanId);
        var limit = await _planService.UpsertPlanLimitAsync(request, cancellationToken);
        return Ok(limit);
    }

    /// <summary>Deletes a plan limit.</summary>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePlanLimit(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogWarning("Admin deleting plan limit {LimitId}", id);
        var result = await _planService.DeletePlanLimitAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}

