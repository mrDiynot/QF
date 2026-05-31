// -----------------------------------------------------------------------
// <copyright file="AdminFeaturesController.cs" company="QualiFlow">
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
/// Admin controller for managing features.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/features")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminFeaturesController : ControllerBase
{
    private readonly IAdminPlanManagementService _planService;
    private readonly ILogger<AdminFeaturesController> _logger;

    /// <summary>Initializes a new instance of the <see cref="AdminFeaturesController"/> class.</summary>
    public AdminFeaturesController(IAdminPlanManagementService planService, ILogger<AdminFeaturesController> logger)
    {
        _planService = planService;
        _logger = logger;
    }

    /// <summary>Gets all features.</summary>
    /// <returns>A list of all features.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AdminFeatureDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFeatures([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var features = await _planService.GetAllFeaturesAsync(includeInactive, cancellationToken);
        return Ok(features);
    }

    /// <summary>Gets a feature by ID.</summary>
    /// <returns>The feature if found.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AdminFeatureDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFeature(Guid id, CancellationToken cancellationToken)
    {
        var feature = await _planService.GetFeatureByIdAsync(id, cancellationToken);
        return feature == null ? NotFound() : Ok(feature);
    }

    /// <summary>Creates a new feature.</summary>
    /// <returns>The created feature.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AdminFeatureDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFeature([FromBody] AdminFeatureRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin creating feature {FeatureKey}", request.FeatureKey);
        var feature = await _planService.CreateFeatureAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetFeature), new { id = feature.Id }, feature);
    }

    /// <summary>Updates an existing feature.</summary>
    /// <returns>The updated feature.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AdminFeatureDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFeature(Guid id, [FromBody] AdminFeatureRequest request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin updating feature {FeatureId}", id);
        var feature = await _planService.UpdateFeatureAsync(id, request, cancellationToken);
        return feature == null ? NotFound() : Ok(feature);
    }

    /// <summary>Deletes a feature.</summary>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFeature(Guid id, CancellationToken cancellationToken)
    {
        _logger.LogWarning("Admin deleting feature {FeatureId}", id);
        var result = await _planService.DeleteFeatureAsync(id, cancellationToken);
        return result ? NoContent() : NotFound();
    }
}

