// -----------------------------------------------------------------------
// <copyright file="AutoAssignmentRulesController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing auto-assignment rules for leads.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auto-assignment")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class AutoAssignmentRulesController : ControllerBase
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AutoAssignmentRulesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AutoAssignmentRulesController"/> class.
    /// </summary>
    public AutoAssignmentRulesController(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AutoAssignmentRulesController> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all auto-assignment rules for the current business.
    /// </summary>
    /// <returns>List of auto-assignment rules.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<AutoAssignmentRuleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AutoAssignmentRuleDto>>> GetRulesAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var rules = await _context.Set<AutoAssignmentRule>()
            .AsNoTracking()
            .Where(r => r.BusinessId == businessId && r.DeletedAt == null)
            .OrderBy(r => r.Priority)
            .Select(r => new AutoAssignmentRuleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description,
                IsActive = r.IsActive,
                Priority = r.Priority,
                Channel = r.Channel,
                MinLeadScore = r.MinLeadScore,
                MaxLeadScore = r.MaxLeadScore,
                AssignmentType = r.AssignmentType,
                AssignToUserId = r.AssignToUserId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
            })
            .ToListAsync(cancellationToken);

        return Ok(rules);
    }

    /// <summary>
    /// Gets a specific auto-assignment rule.
    /// </summary>
    /// <returns>The auto-assignment rule if found.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AutoAssignmentRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutoAssignmentRuleDto>> GetRuleAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var rule = await _context.Set<AutoAssignmentRule>()
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId && r.DeletedAt == null, cancellationToken);

        if (rule == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(rule));
    }

    /// <summary>
    /// Creates a new auto-assignment rule.
    /// </summary>
    /// <returns>The created auto-assignment rule.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AutoAssignmentRuleDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AutoAssignmentRuleDto>> CreateRuleAsync(
        [FromBody] CreateAutoAssignmentRuleRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation("Creating auto-assignment rule '{Name}' for business {BusinessId}", request.Name, businessId);

        var maxPriority = await _context.Set<AutoAssignmentRule>()
            .Where(r => r.BusinessId == businessId && r.DeletedAt == null)
            .MaxAsync(r => (int?)r.Priority, cancellationToken) ?? 0;

        var rule = new AutoAssignmentRule
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive,
            Priority = request.Priority ?? maxPriority + 1,
            Channel = request.Channel,
            MinLeadScore = request.MinLeadScore,
            MaxLeadScore = request.MaxLeadScore,
            AssignmentType = request.AssignmentType ?? "round_robin",
            AssignToUserId = request.AssignToUserId,
        };

        _context.Set<AutoAssignmentRule>().Add(rule);
        await _context.SaveChangesAsync(cancellationToken);

        // Use Created with explicit URI instead of CreatedAtAction to avoid API versioning route matching issues
        var locationUri = new Uri($"/api/v1/auto-assignment/{rule.Id}", UriKind.Relative);
        return Created(locationUri, MapToDto(rule));
    }

    /// <summary>
    /// Updates an auto-assignment rule.
    /// </summary>
    /// <returns>The updated auto-assignment rule.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AutoAssignmentRuleDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AutoAssignmentRuleDto>> UpdateRuleAsync(
        Guid id,
        [FromBody] UpdateAutoAssignmentRuleRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var rule = await _context.Set<AutoAssignmentRule>()
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId && r.DeletedAt == null, cancellationToken);

        if (rule == null)
        {
            return NotFound();
        }

        if (request.Name != null)
        {
            rule.Name = request.Name;
        }

        if (request.Description != null)
        {
            rule.Description = request.Description;
        }

        if (request.IsActive.HasValue)
        {
            rule.IsActive = request.IsActive.Value;
        }

        if (request.Priority.HasValue)
        {
            rule.Priority = request.Priority.Value;
        }

        if (request.Channel != null)
        {
            rule.Channel = request.Channel;
        }

        if (request.MinLeadScore.HasValue)
        {
            rule.MinLeadScore = request.MinLeadScore;
        }

        if (request.MaxLeadScore.HasValue)
        {
            rule.MaxLeadScore = request.MaxLeadScore;
        }

        if (request.AssignmentType != null)
        {
            rule.AssignmentType = request.AssignmentType;
        }

        if (request.AssignToUserId.HasValue)
        {
            rule.AssignToUserId = request.AssignToUserId;
        }

        rule.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated auto-assignment rule {RuleId}", id);

        return Ok(MapToDto(rule));
    }

    /// <summary>
    /// Deletes an auto-assignment rule.
    /// </summary>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRuleAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var rule = await _context.Set<AutoAssignmentRule>()
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId && r.DeletedAt == null, cancellationToken);

        if (rule == null)
        {
            return NotFound();
        }

        rule.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deleted auto-assignment rule {RuleId}", id);

        return NoContent();
    }

    /// <summary>
    /// Reorders auto-assignment rules.
    /// </summary>
    /// <returns>The reordered list of rules.</returns>
    [HttpPost("reorder")]
    [ProducesResponseType(typeof(IEnumerable<AutoAssignmentRuleDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AutoAssignmentRuleDto>>> ReorderRulesAsync(
        [FromBody] ReorderRulesRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var rules = await _context.Set<AutoAssignmentRule>()
            .Where(r => r.BusinessId == businessId && r.DeletedAt == null)
            .ToListAsync(cancellationToken);

        for (var i = 0; i < request.RuleIds.Count; i++)
        {
            var rule = rules.Find(r => r.Id == request.RuleIds[i]);
            if (rule != null)
            {
                rule.Priority = i + 1;
                rule.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(rules.OrderBy(r => r.Priority).Select(MapToDto));
    }

    private static AutoAssignmentRuleDto MapToDto(AutoAssignmentRule rule)
    {
        return new AutoAssignmentRuleDto
        {
            Id = rule.Id,
            Name = rule.Name,
            Description = rule.Description,
            IsActive = rule.IsActive,
            Priority = rule.Priority,
            Channel = rule.Channel,
            MinLeadScore = rule.MinLeadScore,
            MaxLeadScore = rule.MaxLeadScore,
            AssignmentType = rule.AssignmentType,
            AssignToUserId = rule.AssignToUserId,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt,
        };
    }
}

// ============================================================================
// DTOs
// ============================================================================

#pragma warning disable CA1002, CA2227, MA0016 // Collection rules - DTOs need mutable collections for serialization

/// <summary>
/// Auto-assignment rule DTO.
/// </summary>
public class AutoAssignmentRuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; }
    public string? Channel { get; set; }
    public int? MinLeadScore { get; set; }
    public int? MaxLeadScore { get; set; }
    public string AssignmentType { get; set; } = "round_robin";
    public Guid? AssignToUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Request to create an auto-assignment rule.
/// </summary>
public class CreateAutoAssignmentRuleRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int? Priority { get; set; }
    public string? Channel { get; set; }
    public int? MinLeadScore { get; set; }
    public int? MaxLeadScore { get; set; }
    public string? AssignmentType { get; set; }
    public Guid? AssignToUserId { get; set; }
}

/// <summary>
/// Request to update an auto-assignment rule.
/// </summary>
public class UpdateAutoAssignmentRuleRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
    public int? Priority { get; set; }
    public string? Channel { get; set; }
    public int? MinLeadScore { get; set; }
    public int? MaxLeadScore { get; set; }
    public string? AssignmentType { get; set; }
    public Guid? AssignToUserId { get; set; }
}

/// <summary>
/// Request to reorder rules.
/// </summary>
public class ReorderRulesRequest
{
    public List<Guid> RuleIds { get; set; } = [];
}
