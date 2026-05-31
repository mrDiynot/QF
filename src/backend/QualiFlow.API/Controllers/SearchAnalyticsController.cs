// <copyright file="SearchAnalyticsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for search analytics and insights (S15-BE-004).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/search/analytics")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class SearchAnalyticsController(
    QualiFlowDbContext context,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Gets the top search queries for the business.
    /// </summary>
    /// <param name="days">Number of days to look back (default: 30).</param>
    /// <param name="limit">Maximum number of results (default: 10, max: 50).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Top search queries with usage count.</returns>
    /// <response code="200">Top searches retrieved successfully.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet("top-searches")]
    [CacheControl(CacheStrategies.MediumTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<TopSearchResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<TopSearchResult>>> GetTopSearches(
        [FromQuery] int days = 30,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        if (limit > 50)
        {
            limit = 50;
        }

        var since = DateTime.UtcNow.AddDays(-days);

        var topSearches = await context.SearchAnalytics
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId && s.SearchedAt >= since)
            .GroupBy(s => s.SearchQuery.ToLowerInvariant())
            .Select(g => new TopSearchResult
            {
                Query = g.Key,
                Count = g.Count(),
                AverageResultsCount = (int)g.Average(s => s.ResultsCount),
                AverageExecutionTimeMs = (long)g.Average(s => s.ExecutionTimeMs),
                LastSearchedAt = g.Max(s => s.SearchedAt),
            })
            .OrderByDescending(r => r.Count)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return Ok(topSearches);
    }

    /// <summary>
    /// Gets search queries that returned zero results.
    /// </summary>
    /// <param name="days">Number of days to look back (default: 30).</param>
    /// <param name="limit">Maximum number of results (default: 10, max: 50).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Zero-result searches with usage count.</returns>
    /// <response code="200">Zero-result searches retrieved successfully.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet("zero-results")]
    [ProducesResponseType(typeof(IReadOnlyList<ZeroResultSearch>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<ZeroResultSearch>>> GetZeroResultSearches(
        [FromQuery] int days = 30,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();

        if (limit > 50)
        {
            limit = 50;
        }

        var since = DateTime.UtcNow.AddDays(-days);

        var zeroResults = await context.SearchAnalytics
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId && s.SearchedAt >= since && s.ResultsCount == 0)
            .GroupBy(s => s.SearchQuery.ToLowerInvariant())
            .Select(g => new ZeroResultSearch
            {
                Query = g.Key,
                Count = g.Count(),
                LastSearchedAt = g.Max(s => s.SearchedAt),
            })
            .OrderByDescending(r => r.Count)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return Ok(zeroResults);
    }

    /// <summary>
    /// Gets search performance metrics.
    /// </summary>
    /// <param name="days">Number of days to look back (default: 30).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Search performance metrics.</returns>
    /// <response code="200">Performance metrics retrieved successfully.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(SearchPerformanceMetrics), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SearchPerformanceMetrics>> GetPerformanceMetrics(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        var businessId = currentUserService.GetBusinessId();
        var since = DateTime.UtcNow.AddDays(-days);

        var analytics = await context.SearchAnalytics
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId && s.SearchedAt >= since)
            .ToListAsync(cancellationToken);

        if (analytics.Count == 0)
        {
            return Ok(new SearchPerformanceMetrics
            {
                TotalSearches = 0,
                AverageExecutionTimeMs = 0,
                MedianExecutionTimeMs = 0,
                P95ExecutionTimeMs = 0,
                P99ExecutionTimeMs = 0,
                ZeroResultsPercentage = 0,
                AverageResultsCount = 0,
            });
        }

        var executionTimes = analytics.Select(a => a.ExecutionTimeMs).OrderBy(t => t).ToList();
        var p95Index = (int)Math.Ceiling(executionTimes.Count * 0.95) - 1;
        var p99Index = (int)Math.Ceiling(executionTimes.Count * 0.99) - 1;
        var medianIndex = executionTimes.Count / 2;

        var metrics = new SearchPerformanceMetrics
        {
            TotalSearches = analytics.Count,
            AverageExecutionTimeMs = (long)analytics.Average(a => a.ExecutionTimeMs),
            MedianExecutionTimeMs = executionTimes[medianIndex],
            P95ExecutionTimeMs = executionTimes[p95Index],
            P99ExecutionTimeMs = executionTimes[p99Index],
            ZeroResultsPercentage = (double)analytics.Count(a => a.ResultsCount == 0) / analytics.Count * 100,
            AverageResultsCount = (int)analytics.Average(a => a.ResultsCount),
        };

        return Ok(metrics);
    }
}

/// <summary>
/// Response model for top search queries.
/// </summary>
public record TopSearchResult
{
    /// <summary>
    /// Gets the search query.
    /// </summary>
    public required string Query { get; init; }

    /// <summary>
    /// Gets the number of times this query was searched.
    /// </summary>
    public required int Count { get; init; }

    /// <summary>
    /// Gets the average number of results returned.
    /// </summary>
    public required int AverageResultsCount { get; init; }

    /// <summary>
    /// Gets the average execution time in milliseconds.
    /// </summary>
    public required long AverageExecutionTimeMs { get; init; }

    /// <summary>
    /// Gets the last time this query was searched.
    /// </summary>
    public required DateTime LastSearchedAt { get; init; }
}

/// <summary>
/// Response model for zero-result searches.
/// </summary>
public record ZeroResultSearch
{
    /// <summary>
    /// Gets the search query.
    /// </summary>
    public required string Query { get; init; }

    /// <summary>
    /// Gets the number of times this query returned zero results.
    /// </summary>
    public required int Count { get; init; }

    /// <summary>
    /// Gets the last time this query was searched.
    /// </summary>
    public required DateTime LastSearchedAt { get; init; }
}

/// <summary>
/// Response model for search performance metrics.
/// </summary>
public record SearchPerformanceMetrics
{
    /// <summary>
    /// Gets the total number of searches.
    /// </summary>
    public required int TotalSearches { get; init; }

    /// <summary>
    /// Gets the average execution time in milliseconds.
    /// </summary>
    public required long AverageExecutionTimeMs { get; init; }

    /// <summary>
    /// Gets the median execution time in milliseconds.
    /// </summary>
    public required long MedianExecutionTimeMs { get; init; }

    /// <summary>
    /// Gets the 95th percentile execution time in milliseconds.
    /// </summary>
    public required long P95ExecutionTimeMs { get; init; }

    /// <summary>
    /// Gets the 99th percentile execution time in milliseconds.
    /// </summary>
    public required long P99ExecutionTimeMs { get; init; }

    /// <summary>
    /// Gets the percentage of searches that returned zero results.
    /// </summary>
    public required double ZeroResultsPercentage { get; init; }

    /// <summary>
    /// Gets the average number of results per search.
    /// </summary>
    public required int AverageResultsCount { get; init; }
}

