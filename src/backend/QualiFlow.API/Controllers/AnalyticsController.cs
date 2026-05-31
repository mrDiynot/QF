using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for analytics and business intelligence operations.
/// Provides RESTful endpoints for retrieving dashboard metrics, conversion funnels,
/// channel performance, and ROI calculations.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All analytics are automatically filtered by the current user's business ID.
/// - Date ranges: All endpoints support custom date ranges via query parameters.
/// - Performance: Analytics queries are optimized for read-only operations using AsNoTracking().
/// - Real-time: All metrics are calculated in real-time from current database state.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class AnalyticsController(
    IAnalyticsService analyticsService,
    IQrCodeAnalyticsService qrCodeAnalyticsService,
    IFormAnalyticsService formAnalyticsService,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Gets dashboard metrics for the authenticated user's business.
    /// Includes total leads, qualified leads, conversations, messages, conversion rates, and active channels.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Dashboard metrics including leads, conversations, and conversion rates.</returns>
    /// <response code="200">Returns the dashboard metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/dashboard?startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// This endpoint automatically filters metrics by the authenticated user's business ID (multi-tenancy).
    /// Only data belonging to the current user's business will be included in calculations.
    ///
    /// Date range defaults:
    /// - If startDate is not provided, defaults to 30 days ago
    /// - If endDate is not provided, defaults to tomorrow (to include today's data)
    ///
    /// Metrics included:
    /// - Total Leads: Count of all leads created in the date range
    /// - Qualified Leads: Count of leads with status = Qualified
    /// - Total Conversations: Count of conversations started in the date range
    /// - Total Messages: Count of all messages sent/received in the date range
    /// - Average Response Time: Average time from conversation start to first agent response.
    /// - Conversion Rate: Percentage of leads that became qualified (qualified/total * 100).
    /// - Active Channels: Count of currently active communication channels.
    /// </remarks>
    [HttpGet("dashboard")]
    [CacheControl(60, "Authorization")] // Cache for 1 minute per user - real-time dashboard data
    [ProducesResponseType(typeof(DashboardMetricsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<DashboardMetricsDto>> GetDashboardMetricsAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        // Get current user's business ID
        var businessId = currentUserService.GetBusinessId();

        // Set default date range: last 30 days if not provided
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        // Validate date range
        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Create date range
        var dateRange = new DateRange
        {
            Start = start,
            End = end
        };

        // Get dashboard metrics
        var metrics = await analyticsService.GetDashboardMetricsAsync(
            businessId,
            dateRange,
            cancellationToken);

        return Ok(metrics);
    }

    /// <summary>
    /// Gets conversion funnel metrics showing lead progression through qualification stages.
    /// Shows how many leads progress from initial capture to conversion.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Conversion funnel metrics from leads to customers.</returns>
    /// <response code="200">Returns the conversion funnel metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/conversion-funnel?startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// Funnel stages:
    /// 1. Total Leads: All leads created in the date range
    /// 2. Leads with Conversation: Leads that have at least one conversation
    /// 3. Qualified Leads: Leads with status = Qualified
    /// 4. Leads with Booking: Leads that have at least one booking
    /// 5. Converted Leads: Leads with status = Converted
    ///
    /// Conversion rates calculated:
    /// - Lead → Conversation rate.
    /// - Conversation → Qualified rate.
    /// - Qualified → Booking rate.
    /// - Overall conversion rate (Lead → Converted).
    /// </remarks>
    [HttpGet("conversion-funnel")]
    [ProducesResponseType(typeof(ConversionFunnelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversionFunnelDto>> GetConversionFunnelAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        // Get current user's business ID
        var businessId = currentUserService.GetBusinessId();

        // Set default date range: last 30 days if not provided
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        // Validate date range
        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Create date range
        var dateRange = new DateRange
        {
            Start = start,
            End = end
        };

        // Get conversion funnel metrics
        var funnel = await analyticsService.GetConversionFunnelAsync(
            businessId,
            dateRange,
            cancellationToken);

        return Ok(funnel);
    }

    /// <summary>
    /// Gets performance metrics for all active communication channels.
    /// Shows conversations, leads, messages, response times, and conversion rates per channel.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Array of channel performance metrics.</returns>
    /// <response code="200">Returns the channel performance metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/channel-performance?startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// Metrics per channel:
    /// - Channel Type: SMS, Voice, WhatsApp, Instagram, Facebook, Chat Widget
    /// - Channel Name: Custom name given to the channel
    /// - Total Conversations: Number of conversations initiated through this channel
    /// - Total Leads: Number of unique leads captured through this channel
    /// - Total Messages: Number of messages sent/received through this channel
    /// - Average Response Time: Average time to first agent response
    /// - Conversion Rate: Percentage of leads that became qualified
    /// - Qualified Leads: Count of qualified leads from this channel
    ///
    /// Only active channels are included in the results.
    /// </remarks>
    [HttpGet("channel-performance")]
    [ProducesResponseType(typeof(ChannelPerformanceDto[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChannelPerformanceDto[]>> GetChannelPerformanceAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        // Get current user's business ID
        var businessId = currentUserService.GetBusinessId();

        // Set default date range: last 30 days if not provided
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        // Validate date range
        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Create date range
        var dateRange = new DateRange
        {
            Start = start,
            End = end
        };

        // Get channel performance metrics
        var channelMetrics = await analyticsService.GetChannelPerformanceAsync(
            businessId,
            dateRange,
            cancellationToken);

        return Ok(channelMetrics);
    }

    /// <summary>
    /// Calculates return on investment (ROI) for campaigns.
    /// </summary>
    /// <param name="campaignId">Optional campaign ID to filter by specific campaign.</param>
    /// <param name="startDate">Start date for ROI calculation (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for ROI calculation (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>ROI percentage.</returns>
    /// <response code="200">Returns the ROI percentage successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <response code="501">ROI calculation is not yet implemented.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/roi?campaignId=123e4567-e89b-12d3-a456-426614174000&amp;startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// **Note**: This endpoint is planned for future implementation.
    /// ROI calculation requires campaign and revenue tracking features which are not yet available.
    /// Currently returns 501 Not Implemented.
    ///
    /// Future implementation will calculate:
    /// - ROI = (Revenue - Cost) / Cost * 100
    /// - Revenue: Total revenue from leads/customers acquired through the campaign
    /// - Cost: Total campaign spend (ads, resources, etc.)
    /// </remarks>
    [HttpGet("roi")]
    [ProducesResponseType(typeof(decimal), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status501NotImplemented)]
    public async Task<ActionResult<decimal>> CalculateROIAsync(
        [FromQuery] Guid? campaignId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        // Get current user's business ID
        var businessId = currentUserService.GetBusinessId();

        // Set default date range: last 30 days if not provided
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        // Validate date range
        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        // Create date range
        var dateRange = new DateRange
        {
            Start = start,
            End = end
        };

        // Calculate ROI (returns 0 as campaigns not yet implemented)
        await analyticsService.CalculateROIAsync(
            businessId,
            campaignId,
            dateRange,
            cancellationToken);

        // Return Not Implemented since campaigns are not yet in the system
        return StatusCode(
            StatusCodes.Status501NotImplemented,
            new ProblemDetails
            {
                Title = "ROI calculation not implemented",
                Detail = "ROI calculation requires campaign and revenue tracking features which are not yet available. This feature is planned for a future release.",
                Status = StatusCodes.Status501NotImplemented
            });
    }

    /// <summary>
    /// Gets lead source attribution analytics showing performance by source channel.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Array of lead source attribution metrics.</returns>
    /// <response code="200">Returns the lead source attribution metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("lead-source-attribution")]
    [ProducesResponseType(typeof(LeadSourceAttributionDto[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LeadSourceAttributionDto[]>> GetLeadSourceAttributionAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var dateRange = new DateRange { Start = start, End = end };
        var result = await analyticsService.GetLeadSourceAttributionAsync(businessId, dateRange, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets conversion funnel metrics broken down by channel.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Array of conversion funnel metrics by channel.</returns>
    /// <response code="200">Returns the conversion funnel by channel metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("conversion-funnel-by-channel")]
    [ProducesResponseType(typeof(ConversionFunnelByChannelDto[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversionFunnelByChannelDto[]>> GetConversionFunnelByChannelAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var dateRange = new DateRange { Start = start, End = end };
        var result = await analyticsService.GetConversionFunnelByChannelAsync(businessId, dateRange, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets time-to-conversion metrics showing average time through sales stages.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Time-to-conversion metrics.</returns>
    /// <response code="200">Returns the time-to-conversion metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("time-to-conversion")]
    [ProducesResponseType(typeof(TimeToConversionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<TimeToConversionDto>> GetTimeToConversionAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var dateRange = new DateRange { Start = start, End = end };
        var result = await analyticsService.GetTimeToConversionMetricsAsync(businessId, dateRange, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets agent performance metrics showing individual agent statistics.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to tomorrow.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Array of agent performance metrics.</returns>
    /// <response code="200">Returns the agent performance metrics successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("agent-performance")]
    [ProducesResponseType(typeof(AgentPerformanceDto[]), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AgentPerformanceDto[]>> GetAgentPerformanceAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(1);

        if (start >= end)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid date range",
                Detail = "Start date must be before end date.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var dateRange = new DateRange { Start = start, End = end };
        var result = await analyticsService.GetAgentPerformanceAsync(businessId, dateRange, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets revenue forecast based on pipeline and historical data.
    /// </summary>
    /// <param name="period">Forecast period (e.g., "Q1 2026", "January 2026"). Defaults to "Next 30 Days".</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Revenue forecast metrics.</returns>
    /// <response code="200">Returns the revenue forecast successfully.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("revenue-forecast")]
    [ProducesResponseType(typeof(RevenueForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RevenueForecastDto>> GetRevenueForecastAsync(
        [FromQuery] string period = "Next 30 Days",
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var result = await analyticsService.GetRevenueForecastAsync(businessId, period, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets AI usage analytics for the authenticated user's business.
    /// Includes OpenAI token usage, Twilio SMS/Voice costs, and breakdown by operation type.
    /// </summary>
    /// <param name="startDate">Start date for usage data (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for usage data (inclusive). If not provided, defaults to today.</param>
    /// <param name="usageTrackingService">The usage tracking service (injected).</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>AI usage summary including token counts and estimated costs.</returns>
    /// <response code="200">Returns the AI usage analytics successfully.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    [HttpGet("ai-usage")]
    [ProducesResponseType(typeof(ExternalUsageSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ExternalUsageSummary>> GetAIUsageAsync(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] IExternalUsageTrackingService usageTrackingService,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var from = startDate ?? DateTime.UtcNow.AddDays(-30);
        var to = endDate ?? DateTime.UtcNow;

        var result = await usageTrackingService.GetUsageSummaryAsync(businessId, from, to, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets health insights for a specific channel including health score, metrics, and AI recommendations.
    /// Uses real-time data from database - no hardcoded calculations.
    /// </summary>
    /// <param name="channelId">The channel ID to get health insights for.</param>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to today.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Channel health insights including health score and recommendations.</returns>
    /// <response code="200">Returns the channel health insights successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <response code="404">Channel not found or does not belong to the authenticated user's business.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/channel-health/123e4567-e89b-12d3-a456-426614174000?startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// Health Score Calculation (0-100):
    /// - Base Score (50 points): Based on verification status (Verified=50, Pending=25, Failed=10)
    /// - Activity Score (25 points): Based on message volume (1 point per 10 messages)
    /// - Response Rate (15 points): Percentage of conversations with responses
    /// - Conversion Rate (10 points): Percentage of conversations leading to qualified leads
    ///
    /// Status Levels:
    /// - Healthy: Score &gt;= 75
    /// - Warning: Score &gt;= 50
    /// - Critical: Score &lt; 50
    ///
    /// All metrics calculated from real database data - no hardcoded values.
    /// </remarks>
    [HttpGet("channel-health/{channelId}")]
    [ProducesResponseType(typeof(ChannelHealthDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChannelHealthDto>> GetChannelHealthAsync(
        [FromRoute] Guid channelId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        DateRange? dateRange = null;
        if (startDate.HasValue || endDate.HasValue)
        {
            var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow;

            if (start >= end)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid date range",
                    Detail = "Start date must be before end date.",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            dateRange = new DateRange { Start = start, End = end };
        }

        try
        {
            var health = await analyticsService.GetChannelHealthAsync(businessId, channelId, dateRange, cancellationToken);
            return Ok(health);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(new ProblemDetails
            {
                Title = "Channel not found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound
            });
        }
    }

    /// <summary>
    /// Gets health summary for all channels including overall health score and insights per channel.
    /// Uses real-time data from database - no hardcoded calculations.
    /// </summary>
    /// <param name="startDate">Start date for metrics (inclusive). If not provided, defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics (exclusive). If not provided, defaults to today.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>Channel health summary across all channels.</returns>
    /// <response code="200">Returns the channel health summary successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., startDate &gt; endDate).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/analytics/channel-health?startDate=2025-01-01&amp;endDate=2025-03-31
    ///
    /// Returns aggregated health metrics for all channels:
    /// - Overall health score (average across all channels)
    /// - Total channels count
    /// - Active channels count
    /// - Channels needing attention (warning or critical status)
    /// - Individual health insights for each channel
    ///
    /// All metrics calculated from real database data - no hardcoded values.
    /// </remarks>
    [HttpGet("channel-health")]
    [ProducesResponseType(typeof(ChannelHealthSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ChannelHealthSummaryDto>> GetChannelHealthSummaryAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        DateRange? dateRange = null;
        if (startDate.HasValue || endDate.HasValue)
        {
            var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow;

            if (start >= end)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Invalid date range",
                    Detail = "Start date must be before end date.",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            dateRange = new DateRange { Start = start, End = end };
        }

        var summary = await analyticsService.GetChannelHealthSummaryAsync(businessId, dateRange, cancellationToken);
        return Ok(summary);
    }

    // ============================================================================
    // QR CODE ANALYTICS ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets analytics for all QR code campaigns.
    /// </summary>
    /// <param name="campaignId">Optional campaign ID filter.</param>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of QR campaign analytics.</returns>
    /// <response code="200">Returns campaign analytics successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("qrcode/campaigns")]
    [ProducesResponseType(typeof(IReadOnlyList<QrCampaignAnalyticsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetQrCampaignAnalytics(
        [FromQuery] Guid? campaignId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        var request = new QrCampaignAnalyticsRequest
        {
            CampaignId = campaignId,
            StartDate = startDate,
            EndDate = endDate
        };

        var analytics = await qrCodeAnalyticsService.GetQrCampaignAnalyticsAsync(request, cancellationToken);
        return Ok(analytics);
    }

    /// <summary>
    /// Gets geographic distribution of QR scans for a campaign.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of geographic distribution data.</returns>
    /// <response code="200">Returns geographic data successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Campaign not found.</response>
    [HttpGet("qrcode/geography/{campaignId}")]
    [ProducesResponseType(typeof(IReadOnlyList<QrGeographicDistributionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQrGeographicDistribution(
        Guid campaignId,
        CancellationToken cancellationToken = default)
    {
        var geoData = await qrCodeAnalyticsService.GetQrGeographicDistributionAsync(campaignId, cancellationToken);
        return Ok(geoData);
    }

    /// <summary>
    /// Gets device and browser analytics for QR scans.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of device analytics data.</returns>
    /// <response code="200">Returns device analytics successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Campaign not found.</response>
    [HttpGet("qrcode/devices/{campaignId}")]
    [ProducesResponseType(typeof(IReadOnlyList<QrDeviceAnalyticsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQrDeviceAnalytics(
        Guid campaignId,
        CancellationToken cancellationToken = default)
    {
        var deviceData = await qrCodeAnalyticsService.GetQrDeviceAnalyticsAsync(campaignId, cancellationToken);
        return Ok(deviceData);
    }

    /// <summary>
    /// Gets timeline data for QR scans.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="startDate">Start date for timeline.</param>
    /// <param name="endDate">End date for timeline.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of timeline data points.</returns>
    /// <response code="200">Returns timeline data successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Campaign not found.</response>
    [HttpGet("qrcode/timeline/{campaignId}")]
    [ProducesResponseType(typeof(IReadOnlyList<QrScanTimelineDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQrScanTimeline(
        Guid campaignId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var timeline = await qrCodeAnalyticsService.GetQrScanTimelineAsync(campaignId, start, end, cancellationToken);
        return Ok(timeline);
    }

    // ============================================================================
    // FORM ANALYTICS ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets analytics for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Form analytics data.</returns>
    /// <response code="200">Returns form analytics successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Form not found.</response>
    [HttpGet("forms/{formId}")]
    [ProducesResponseType(typeof(FormAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFormAnalytics(
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        var analytics = await formAnalyticsService.GetFormAnalyticsAsync(formId, cancellationToken);

        if (analytics == null)
        {
            return NotFound(new { message = "Form not found or access denied." });
        }

        return Ok(analytics);
    }

    /// <summary>
    /// Gets all A/B test results for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of A/B test results.</returns>
    /// <response code="200">Returns A/B test results successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("forms/ab-tests")]
    [ProducesResponseType(typeof(IReadOnlyList<AbTestResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAbTestResults(CancellationToken cancellationToken = default)
    {
        var results = await formAnalyticsService.GetAbTestResultsAsync(cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Gets field drop-off analysis for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of field drop-off data.</returns>
    /// <response code="200">Returns drop-off analysis successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Form not found.</response>
    [HttpGet("forms/{formId}/drop-offs")]
    [ProducesResponseType(typeof(IReadOnlyList<FieldDropOffDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFieldDropOffAnalysis(
        Guid formId,
        CancellationToken cancellationToken = default)
    {
        var dropOffs = await formAnalyticsService.GetFieldDropOffAnalysisAsync(formId, cancellationToken);
        return Ok(dropOffs);
    }

    /// <summary>
    /// Gets submission timeline for a specific form.
    /// </summary>
    /// <param name="formId">Form identifier.</param>
    /// <param name="startDate">Start date for timeline.</param>
    /// <param name="endDate">End date for timeline.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of timeline data points.</returns>
    /// <response code="200">Returns timeline data successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Form not found.</response>
    [HttpGet("forms/{formId}/timeline")]
    [ProducesResponseType(typeof(IReadOnlyList<FormSubmissionTimelineDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFormSubmissionTimeline(
        Guid formId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken = default)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var timeline = await formAnalyticsService.GetFormSubmissionTimelineAsync(formId, start, end, cancellationToken);
        return Ok(timeline);
    }

    // ============================================================================
    // ATTRIBUTION ANALYTICS ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets QR-to-Form attribution data for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of attribution data.</returns>
    /// <response code="200">Returns attribution data successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("attribution/qr-to-form")]
    [ProducesResponseType(typeof(IReadOnlyList<QrToFormAttributionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetQrToFormAttribution(CancellationToken cancellationToken = default)
    {
        var attribution = await formAnalyticsService.GetQrToFormAttributionAsync(cancellationToken);
        return Ok(attribution);
    }

    // ============================================================================
    // SOCIAL CHANNEL ANALYTICS ENDPOINTS
    // ============================================================================

    /// <summary>
    /// Gets comprehensive analytics for a specific social channel (Instagram, Facebook, WhatsApp).
    /// </summary>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="startDate">Start date for analytics (inclusive). Defaults to 30 days ago.</param>
    /// <param name="endDate">End date for analytics (exclusive). Defaults to now.</param>
    /// <param name="socialAnalyticsService">Social channel analytics service.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed social channel analytics including messaging, engagement, and conversion metrics.</returns>
    /// <response code="200">Returns social channel analytics successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Channel not found.</response>
    [HttpGet("social/{channelId}")]
    [ProducesResponseType(typeof(SocialChannelAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SocialChannelAnalyticsDto>> GetSocialChannelAnalytics(
        Guid channelId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] ISocialChannelAnalyticsService socialAnalyticsService,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var dateRange = new DateRange
        {
            Start = startDate ?? DateTime.UtcNow.AddDays(-30),
            End = endDate ?? DateTime.UtcNow
        };

        var analytics = await socialAnalyticsService.GetChannelAnalyticsAsync(
            businessId, channelId, dateRange, cancellationToken);

        return Ok(analytics);
    }

    /// <summary>
    /// Gets summary analytics across all social channels for the business.
    /// </summary>
    /// <param name="startDate">Start date for analytics (inclusive). Defaults to 30 days ago.</param>
    /// <param name="endDate">End date for analytics (exclusive). Defaults to now.</param>
    /// <param name="socialAnalyticsService">Social channel analytics service.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Aggregated analytics across all social channels with individual breakdowns.</returns>
    /// <response code="200">Returns social channels summary successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("social/summary")]
    [ProducesResponseType(typeof(SocialChannelsSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SocialChannelsSummaryDto>> GetSocialChannelsSummary(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] ISocialChannelAnalyticsService socialAnalyticsService,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var dateRange = new DateRange
        {
            Start = startDate ?? DateTime.UtcNow.AddDays(-30),
            End = endDate ?? DateTime.UtcNow
        };

        var summary = await socialAnalyticsService.GetSocialChannelsSummaryAsync(
            businessId, dateRange, cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Gets conversations at risk of exceeding the 24-hour Meta response window.
    /// </summary>
    /// <param name="channelId">Optional channel ID to filter by specific channel.</param>
    /// <param name="socialAnalyticsService">Social channel analytics service.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Count and IDs of conversations at risk.</returns>
    /// <response code="200">Returns at-risk conversations successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("social/at-risk")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAtRiskConversations(
        [FromQuery] Guid? channelId,
        [FromServices] ISocialChannelAnalyticsService socialAnalyticsService,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var (count, conversationIds) = await socialAnalyticsService.GetAtRiskConversationsAsync(
            businessId, channelId, cancellationToken);

        return Ok(new { count, conversationIds });
    }

    /// <summary>
    /// Gets response window compliance metrics for Meta channels.
    /// </summary>
    /// <param name="channelId">The social channel ID.</param>
    /// <param name="startDate">Start date for metrics. Defaults to 30 days ago.</param>
    /// <param name="endDate">End date for metrics. Defaults to now.</param>
    /// <param name="socialAnalyticsService">Social channel analytics service.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Response window compliance metrics.</returns>
    /// <response code="200">Returns response window metrics successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("social/{channelId}/response-window")]
    [ProducesResponseType(typeof(ResponseWindowMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ResponseWindowMetrics>> GetResponseWindowMetrics(
        Guid channelId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromServices] ISocialChannelAnalyticsService socialAnalyticsService,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var dateRange = new DateRange
        {
            Start = startDate ?? DateTime.UtcNow.AddDays(-30),
            End = endDate ?? DateTime.UtcNow
        };

        var metrics = await socialAnalyticsService.GetResponseWindowMetricsAsync(
            businessId, channelId, dateRange, cancellationToken);

        return Ok(metrics);
    }
}
