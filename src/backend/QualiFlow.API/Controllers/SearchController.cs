// <copyright file="SearchController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Search.DTOs;
using QualiFlow.Application.Features.Search.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for global search operations across all entities.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class SearchController(
    IGlobalSearchService searchService,
    ICurrentUserService currentUserService) : ControllerBase
{
    /// <summary>
    /// Performs a global search across leads, conversations, messages, contacts, and deals.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated search results.</returns>
    /// <response code="200">Search completed successfully.</response>
    /// <response code="400">Invalid search request.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpPost("global")]
    [ProducesResponseType(typeof(GlobalSearchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GlobalSearchResponse>> GlobalSearch(
        [FromBody] GlobalSearchRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Query) || request.Query.Length < 2)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Search Query",
                Detail = "Search query must be at least 2 characters long.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = currentUserService.GetBusinessId();
        var results = await searchService.SearchAsync(businessId, request, cancellationToken);

        return Ok(results);
    }

    /// <summary>
    /// Performs a quick search with minimal parameters (query string only).
    /// </summary>
    /// <param name="q">The search query.</param>
    /// <param name="limit">Maximum number of results (default: 10, max: 50).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Search results.</returns>
    /// <response code="200">Search completed successfully.</response>
    /// <response code="400">Invalid search query.</response>
    /// <response code="401">Unauthorized - invalid or missing JWT token.</response>
    [HttpGet("quick")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(GlobalSearchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GlobalSearchResponse>> QuickSearch(
        [FromQuery] string q,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid Search Query",
                Detail = "Search query must be at least 2 characters long.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        if (limit < 1 || limit > 50)
        {
            limit = 10;
        }

        var businessId = currentUserService.GetBusinessId();
        var request = new GlobalSearchRequest
        {
            Query = q,
            Page = 1,
            PageSize = limit,
        };

        var results = await searchService.SearchAsync(businessId, request, cancellationToken);

        return Ok(results);
    }
}

