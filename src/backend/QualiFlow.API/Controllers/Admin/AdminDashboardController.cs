using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.DTOs.Admin;
using QualiFlow.Application.Interfaces.Admin;

namespace QualiFlow.Api.Controllers.Admin;

/// <summary>
/// Controller for admin dashboard metrics and platform-wide analytics.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/dashboard")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Policy = "RequireAnyAdmin")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;
    private readonly ILogger<AdminDashboardController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminDashboardController"/> class.
    /// </summary>
    /// <param name="dashboardService">The dashboard service.</param>
    /// <param name="logger">The logger.</param>
    public AdminDashboardController(
        IAdminDashboardService dashboardService,
        ILogger<AdminDashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Gets platform-wide dashboard metrics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Dashboard metrics including businesses, users, subscriptions, and MRR.</returns>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(AdminDashboardMetricsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminDashboardMetricsDto>> GetMetrics(
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin dashboard metrics requested");

        var metrics = await _dashboardService.GetDashboardMetricsAsync(cancellationToken);

        return Ok(metrics);
    }

    /// <summary>
    /// Gets recent platform activity.
    /// </summary>
    /// <param name="limit">Maximum number of activities to return (default: 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of recent platform activities.</returns>
    [HttpGet("activity")]
    [ProducesResponseType(typeof(IEnumerable<AdminActivityItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<AdminActivityItemDto>>> GetRecentActivity(
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin recent activity requested with limit {Limit}", limit);

        var activities = await _dashboardService.GetRecentActivityAsync(limit, cancellationToken);

        return Ok(activities);
    }

    /// <summary>
    /// Gets subscription breakdown by plan.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Subscription counts grouped by plan.</returns>
    [HttpGet("subscriptions/breakdown")]
    [ProducesResponseType(typeof(IEnumerable<SubscriptionPlanMetricDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanMetricDto>>> GetSubscriptionBreakdown(
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Admin subscription breakdown requested");

        var breakdown = await _dashboardService.GetSubscriptionBreakdownAsync(cancellationToken);

        return Ok(breakdown);
    }
}

