// -----------------------------------------------------------------------
// <copyright file="AdminPlanFeaturesController.cs" company="QualiFlow">
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
/// Admin controller for managing plan-feature assignments.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/plan-features")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminPlanFeaturesController : ControllerBase
{
    private readonly IAdminPlanManagementService _planService;
    private readonly ILogger<AdminPlanFeaturesController> _logger;

    /// <summary>Initializes a new instance of the <see cref="AdminPlanFeaturesController"/> class.</summary>
    public AdminPlanFeaturesController(IAdminPlanManagementService planService, ILogger<AdminPlanFeaturesController> logger)
    {
        _planService = planService;
        _logger = logger;
    }

    /// <summary>Gets all plan-feature assignments, optionally filtered by plan ID.</summary>
    /// <returns>A list of plan-feature assignments.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminPlanFeatureDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPlanFeatures([FromQuery] Guid? planId = null, CancellationToken cancellationToken = default)
    {
        var planFeatures = await _planService.GetAllPlanFeaturesAsync(planId, cancellationToken);
        return Ok(planFeatures);
    }

    /// <summary>Assigns a feature to a plan.</summary>
    /// <returns>The created plan-feature assignment.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AdminPlanFeatureDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AssignFeatureToPlan([FromBody] AdminPlanFeatureRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin assigning feature {FeatureId} to plan {PlanId}", request.FeatureId, request.PlanId);
        var planFeature = await _planService.AssignFeatureToPlanAsync(request, cancellationToken);
        return Ok(planFeature);
    }

    /// <summary>Removes a feature from a plan.</summary>
    /// <returns>No content if successful.</returns>
    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFeatureFromPlan([FromQuery] Guid planId, [FromQuery] Guid featureId, CancellationToken cancellationToken)
    {
        _logger.LogWarning("Admin removing feature {FeatureId} from plan {PlanId}", featureId, planId);
        var result = await _planService.RemoveFeatureFromPlanAsync(planId, featureId, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}

