// <copyright file="TrackedLinksController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

#pragma warning disable SA1615 // Element return value should be documented
#pragma warning disable SA1503 // Braces should not be omitted
#pragma warning disable S1075 // Refactor your code not to use hardcoded absolute paths or URIs
#pragma warning disable CA5394 // Random is an insecure random number generator
#pragma warning disable SCS0005 // Weak random number generator

using Asp.Versioning;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Links.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for tracked link operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/links")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class TrackedLinksController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IConfiguration _configuration;

    public TrackedLinksController(
        QualiFlowDbContext dbContext,
        ICurrentUserService currentUserService,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _configuration = configuration;
    }

    /// <summary>
    /// Gets all tracked links for the current business.
    /// </summary>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<TrackedLinkDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TrackedLinkDto>>> GetLinksAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var baseUrl = _configuration["App:BaseUrl"] ?? "https://qualiflow.ai";

        var links = await _dbContext.Set<TrackedLink>()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null)
            .OrderByDescending(l => l.CreatedAt)
            .Select(l => new TrackedLinkDto
            {
                Id = l.Id,
                Name = l.Name,
                Slug = l.Slug,
                ShortUrl = $"{baseUrl}/l/{l.Slug}",
                DestinationUrl = l.DestinationUrl,
                Clicks = l.Clicks,
                Conversions = l.Conversions,
                ConversionRate = l.Clicks > 0 ? Math.Round((decimal)l.Conversions / l.Clicks * 100, 1) : 0,
                IsActive = l.IsActive,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(links);
    }

    /// <summary>
    /// Gets tracked link statistics.
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(TrackedLinkStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrackedLinkStatsDto>> GetStatsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var links = await _dbContext.Set<TrackedLink>()
            .Where(l => l.BusinessId == businessId && l.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var stats = new TrackedLinkStatsDto
        {
            TotalLinks = links.Count,
            TotalClicks = links.Sum(l => l.Clicks),
            TotalConversions = links.Sum(l => l.Conversions),
            AverageConversionRate = links.Count > 0 && links.Sum(l => l.Clicks) > 0
                ? Math.Round((decimal)links.Sum(l => l.Conversions) / links.Sum(l => l.Clicks) * 100, 1)
                : 0
        };

        return Ok(stats);
    }

    /// <summary>
    /// Creates a new tracked link.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(TrackedLinkDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TrackedLinkDto>> CreateLinkAsync(
        [FromBody] CreateTrackedLinkRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var baseUrl = _configuration["App:BaseUrl"] ?? "https://qualiflow.ai";

        // Generate slug if not provided
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug()
            : request.Slug.ToLowerInvariant().Replace(" ", "-", StringComparison.Ordinal);

        // Check for duplicate slug
        var existingSlug = await _dbContext.Set<TrackedLink>()
            .AnyAsync(l => l.Slug == slug && l.DeletedAt == null, cancellationToken);

        if (existingSlug)
        {
            slug = $"{slug}-{GenerateSlug(4)}";
        }

        var link = new TrackedLink
        {
            BusinessId = businessId,
            Name = request.Name,
            Slug = slug,
            DestinationUrl = request.DestinationUrl,
            IsActive = true
        };

        _dbContext.Set<TrackedLink>().Add(link);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new TrackedLinkDto
        {
            Id = link.Id,
            Name = link.Name,
            Slug = link.Slug,
            ShortUrl = $"{baseUrl}/l/{link.Slug}",
            DestinationUrl = link.DestinationUrl,
            Clicks = 0,
            Conversions = 0,
            ConversionRate = 0,
            IsActive = true,
            CreatedAt = link.CreatedAt
        };

        return CreatedAtAction(nameof(GetLinksAsync), new { id = link.Id }, dto);
    }

    /// <summary>
    /// Updates a tracked link.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(TrackedLinkDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrackedLinkDto>> UpdateLinkAsync(
        Guid id,
        [FromBody] UpdateTrackedLinkRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var baseUrl = _configuration["App:BaseUrl"] ?? "https://qualiflow.ai";

        var link = await _dbContext.Set<TrackedLink>()
            .FirstOrDefaultAsync(l => l.Id == id && l.BusinessId == businessId && l.DeletedAt == null, cancellationToken);

        if (link == null)
        {
            return NotFound();
        }

        if (request.Name != null) link.Name = request.Name;
        if (request.DestinationUrl != null) link.DestinationUrl = request.DestinationUrl;
        if (request.IsActive.HasValue) link.IsActive = request.IsActive.Value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new TrackedLinkDto
        {
            Id = link.Id,
            Name = link.Name,
            Slug = link.Slug,
            ShortUrl = $"{baseUrl}/l/{link.Slug}",
            DestinationUrl = link.DestinationUrl,
            Clicks = link.Clicks,
            Conversions = link.Conversions,
            ConversionRate = link.Clicks > 0 ? Math.Round((decimal)link.Conversions / link.Clicks * 100, 1) : 0,
            IsActive = link.IsActive,
            CreatedAt = link.CreatedAt
        });
    }

    /// <summary>
    /// Deletes a tracked link.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLinkAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var link = await _dbContext.Set<TrackedLink>()
            .FirstOrDefaultAsync(l => l.Id == id && l.BusinessId == businessId && l.DeletedAt == null, cancellationToken);

        if (link == null)
        {
            return NotFound();
        }

        link.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Records a click on a tracked link (public endpoint).
    /// </summary>
    [HttpPost("{slug}/click")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordClickAsync(string slug, CancellationToken cancellationToken)
    {
        var link = await _dbContext.Set<TrackedLink>()
            .FirstOrDefaultAsync(l => l.Slug == slug && l.IsActive && l.DeletedAt == null, cancellationToken);

        if (link == null)
        {
            return NotFound();
        }

        link.Clicks++;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { destinationUrl = link.DestinationUrl });
    }

    /// <summary>
    /// Records a conversion on a tracked link.
    /// </summary>
    [HttpPost("{slug}/convert")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordConversionAsync(string slug, CancellationToken cancellationToken)
    {
        var link = await _dbContext.Set<TrackedLink>()
            .FirstOrDefaultAsync(l => l.Slug == slug && l.DeletedAt == null, cancellationToken);

        if (link == null)
        {
            return NotFound();
        }

        link.Conversions++;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok();
    }

    private static string GenerateSlug(int length = 8)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
    }
}
