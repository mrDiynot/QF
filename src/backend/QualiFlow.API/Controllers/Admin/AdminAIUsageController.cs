using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Admin.Authorization;

namespace QualiFlow.Api.Controllers.Admin;

/// <summary>
/// Controller for admin AI usage analytics and monitoring.
/// Provides platform-wide visibility into AI service usage across businesses.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/ai-usage")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Policy = AdminPolicies.RequireBillingAdmin)]
public class AdminAIUsageController : ControllerBase
{
    private readonly IExternalUsageTrackingService _usageTrackingService;
    private readonly ILogger<AdminAIUsageController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AdminAIUsageController"/> class.
    /// </summary>
    /// <param name="usageTrackingService">The usage tracking service.</param>
    /// <param name="logger">The logger.</param>
    public AdminAIUsageController(
        IExternalUsageTrackingService usageTrackingService,
        ILogger<AdminAIUsageController> logger)
    {
        _usageTrackingService = usageTrackingService;
        _logger = logger;
    }

    /// <summary>
    /// Gets platform-wide AI usage summary.
    /// </summary>
    /// <param name="from">Start date for the query period.</param>
    /// <param name="to">End date for the query period.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Platform-wide usage summary.</returns>
    [HttpGet("platform-summary")]
    [ProducesResponseType(typeof(ExternalUsageSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ExternalUsageSummary>> GetPlatformUsageSummary(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        _logger.LogInformation(
            "Admin platform AI usage summary requested from {From} to {To}",
            fromDate,
            toDate);

        var summary = await _usageTrackingService.GetPlatformUsageSummaryAsync(
            fromDate,
            toDate,
            cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Gets AI usage summary for a specific business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="from">Start date for the query period.</param>
    /// <param name="to">End date for the query period.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Business-specific usage summary.</returns>
    [HttpGet("business/{businessId:guid}")]
    [ProducesResponseType(typeof(ExternalUsageSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExternalUsageSummary>> GetBusinessUsageSummary(
        Guid businessId,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        CancellationToken cancellationToken = default)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        _logger.LogInformation(
            "Admin AI usage summary requested for business {BusinessId} from {From} to {To}",
            businessId,
            fromDate,
            toDate);

        var summary = await _usageTrackingService.GetBusinessUsageSummaryAsync(
            businessId,
            fromDate,
            toDate,
            cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Gets top businesses by AI usage.
    /// </summary>
    /// <param name="from">Start date for the query period.</param>
    /// <param name="to">End date for the query period.</param>
    /// <param name="limit">Maximum number of businesses to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of top businesses by usage.</returns>
    [HttpGet("top-businesses")]
    [ProducesResponseType(typeof(IEnumerable<BusinessUsageInfo>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<BusinessUsageInfo>>> GetTopBusinessesByUsage(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
        var toDate = to ?? DateTime.UtcNow;

        _logger.LogInformation(
            "Admin top businesses by AI usage requested from {From} to {To}, limit {Limit}",
            fromDate,
            toDate,
            limit);

        var topBusinesses = await _usageTrackingService.GetTopBusinessesByUsageAsync(
            fromDate,
            toDate,
            limit,
            cancellationToken);

        return Ok(topBusinesses);
    }
}
