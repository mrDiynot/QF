// -----------------------------------------------------------------------
// <copyright file="AdminSystemHealthController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.Admin.Authorization;
using QualiFlow.Application.Features.Admin.SystemHealth;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin controller for system health monitoring.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/system")]
[Authorize(AuthenticationSchemes = "AdminBearer", Policy = AdminPolicies.RequirePlatformAdmin)]
[Produces("application/json")]
public class AdminSystemHealthController : ControllerBase
{
    private readonly ISystemHealthService _healthService;
    private readonly ILogger<AdminSystemHealthController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminSystemHealthController"/> class.
    /// </summary>
    /// <param name="healthService">The system health service.</param>
    /// <param name="logger">The logger.</param>
    public AdminSystemHealthController(
        ISystemHealthService healthService,
        ILogger<AdminSystemHealthController> logger)
    {
        _healthService = healthService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the overall system health status.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>System health status with service statuses.</returns>
    [HttpGet("health")]
    [ProducesResponseType(typeof(SystemHealthDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SystemHealthDto>> GetSystemHealth(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin checking system health");
        var health = await _healthService.GetSystemHealthAsync(cancellationToken);
        return Ok(health);
    }

    /// <summary>
    /// Gets background job statistics from Hangfire.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Job statistics including queued, processing, succeeded, and failed counts.</returns>
    [HttpGet("jobs")]
    [ProducesResponseType(typeof(JobStatisticsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<JobStatisticsDto>> GetJobStatistics(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin fetching job statistics");
        var stats = await _healthService.GetJobStatisticsAsync(cancellationToken);
        return Ok(stats);
    }

    /// <summary>
    /// Gets external service usage statistics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Usage statistics for Twilio, OpenAI, and Stripe.</returns>
    [HttpGet("external-usage")]
    [ProducesResponseType(typeof(ExternalServiceUsageDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ExternalServiceUsageDto>> GetExternalServiceUsage(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin fetching external service usage");
        var usage = await _healthService.GetExternalServiceUsageAsync(cancellationToken);
        return Ok(usage);
    }

    /// <summary>
    /// Verifies that database seed data matches expected values.
    /// This endpoint checks subscription plans, features, plan_features, plan_limits, and admin users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Seed data verification results showing any discrepancies.</returns>
    [HttpGet("verify-seed-data")]
    [ProducesResponseType(typeof(SeedDataVerificationDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SeedDataVerificationDto>> VerifySeedData(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin verifying seed data");
        var verification = await _healthService.VerifySeedDataAsync(cancellationToken);
        return Ok(verification);
    }

    /// <summary>
    /// Gets Meta (Instagram/Facebook) integration health status.
    /// Includes token expiry status, webhook health, and API connectivity.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Meta integration health status.</returns>
    [HttpGet("meta-health")]
    [ProducesResponseType(typeof(MetaIntegrationHealthDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<MetaIntegrationHealthDto>> GetMetaIntegrationHealth(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin checking Meta integration health");
        var health = await _healthService.GetMetaIntegrationHealthAsync(cancellationToken);
        return Ok(health);
    }
}
