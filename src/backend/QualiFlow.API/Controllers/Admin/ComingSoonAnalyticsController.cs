// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.ComingSoonAnalytics.Dtos;

namespace QualiFlow.API.Controllers.Admin;

/// <summary>
/// Admin API endpoints for Coming Soon page analytics and monitoring.
/// Provides insights into AI chat performance, waitlist signups, and conversion metrics.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/coming-soon-analytics")]
[Authorize(AuthenticationSchemes = "AdminBearer")]
[Authorize(Roles = "SuperAdmin,PlatformAdmin,SupportAdmin")]
public class ComingSoonAnalyticsController : ControllerBase
{
    private readonly IComingSoonAnalyticsService _analyticsService;
    private readonly ILogger<ComingSoonAnalyticsController> _logger;

    private static readonly Guid ComingSoonBusinessId = Guid.Parse("00000000-0000-0000-0000-000000000100");

    public ComingSoonAnalyticsController(
        IComingSoonAnalyticsService analyticsService,
        ILogger<ComingSoonAnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Gets overview metrics for the Coming Soon analytics dashboard.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Overview metrics including sessions, messages, signups, and AI costs.</returns>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(ComingSoonOverviewDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ComingSoonOverviewDto>> GetOverview(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var overview = await _analyticsService.GetOverviewAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        return Ok(overview);
    }

    /// <summary>
    /// Gets a paginated list of chat sessions.
    /// </summary>
    /// <param name="page">Page number (1-indexed).</param>
    /// <param name="pageSize">Number of items per page.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="searchTerm">Optional search term for email/name.</param>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of chat sessions.</returns>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(PaginatedResponse<ChatSessionSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<ChatSessionSummaryDto>>> GetChatSessions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var (sessions, totalCount) = await _analyticsService.GetChatSessionsAsync(
            ComingSoonBusinessId,
            page,
            pageSize,
            status,
            searchTerm,
            startDate,
            endDate,
            cancellationToken);

        return Ok(new PaginatedResponse<ChatSessionSummaryDto>
        {
            Items = sessions,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
        });
    }

    /// <summary>
    /// Gets detailed information about a specific chat session including all messages.
    /// </summary>
    /// <param name="sessionId">The chat session ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detailed chat session with messages.</returns>
    [HttpGet("sessions/{sessionId:guid}")]
    [ProducesResponseType(typeof(ChatSessionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatSessionDetailDto>> GetChatSessionDetail(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var session = await _analyticsService.GetChatSessionDetailAsync(
            ComingSoonBusinessId,
            sessionId,
            cancellationToken);

        if (session == null)
        {
            return NotFound(new { error = "Chat session not found" });
        }

        return Ok(session);
    }

    /// <summary>
    /// Gets AI usage analytics including token usage, costs, and model breakdown.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI usage summary with breakdowns by task type and model.</returns>
    [HttpGet("ai-usage")]
    [ProducesResponseType(typeof(AIUsageSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AIUsageSummaryDto>> GetAIUsageSummary(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var summary = await _analyticsService.GetAIUsageSummaryAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Gets waitlist analytics summary.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Waitlist summary with signup trends and source breakdown.</returns>
    [HttpGet("waitlist/summary")]
    [ProducesResponseType(typeof(WaitlistSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WaitlistSummaryDto>> GetWaitlistSummary(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var summary = await _analyticsService.GetWaitlistSummaryAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        return Ok(summary);
    }

    /// <summary>
    /// Gets a paginated list of waitlist entries.
    /// </summary>
    /// <param name="page">Page number (1-indexed).</param>
    /// <param name="pageSize">Number of items per page.</param>
    /// <param name="source">Optional source filter.</param>
    /// <param name="searchTerm">Optional search term for email.</param>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated list of waitlist entries.</returns>
    [HttpGet("waitlist/entries")]
    [ProducesResponseType(typeof(PaginatedResponse<WaitlistEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<WaitlistEntryDto>>> GetWaitlistEntries(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? source = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var (entries, totalCount) = await _analyticsService.GetWaitlistEntriesAsync(
            ComingSoonBusinessId,
            page,
            pageSize,
            source,
            searchTerm,
            startDate,
            endDate,
            cancellationToken);

        return Ok(new PaginatedResponse<WaitlistEntryDto>
        {
            Items = entries,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
        });
    }

    /// <summary>
    /// Gets intent distribution from chat messages.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of intents with counts and percentages.</returns>
    [HttpGet("intents")]
    [ProducesResponseType(typeof(IReadOnlyList<IntentDistributionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<IntentDistributionDto>>> GetIntentDistribution(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var distribution = await _analyticsService.GetIntentDistributionAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        return Ok(distribution);
    }

    /// <summary>
    /// Gets conversion funnel metrics.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Conversion funnel with step counts and rates.</returns>
    [HttpGet("funnel")]
    [ProducesResponseType(typeof(ConversionFunnelDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ConversionFunnelDto>> GetConversionFunnel(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var funnel = await _analyticsService.GetConversionFunnelAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        return Ok(funnel);
    }

    /// <summary>
    /// Exports waitlist entries to CSV format.
    /// </summary>
    /// <param name="startDate">Optional start date filter.</param>
    /// <param name="endDate">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>CSV file download.</returns>
    [HttpGet("waitlist/export")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportWaitlistToCsv(
        [FromQuery] DateTimeOffset? startDate = null,
        [FromQuery] DateTimeOffset? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var csvBytes = await _analyticsService.ExportWaitlistToCsvAsync(
            ComingSoonBusinessId,
            startDate,
            endDate,
            cancellationToken);

        var fileName = $"waitlist-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv";
        return File(csvBytes, "text/csv", fileName);
    }
}

/// <summary>
/// Generic paginated response wrapper.
/// </summary>
/// <typeparam name="T">The type of items in the response.</typeparam>
public record PaginatedResponse<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
}
