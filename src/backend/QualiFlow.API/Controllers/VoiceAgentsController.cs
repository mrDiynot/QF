// <copyright file="VoiceAgentsController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

#pragma warning disable SA1615 // Element return value should be documented
#pragma warning disable SA1503 // Braces should not be omitted

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.VoiceAgents.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for AI voice agent operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/voice-agents")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class VoiceAgentsController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public VoiceAgentsController(
        QualiFlowDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets all voice agents for the current business.
    /// </summary>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<VoiceAgentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<VoiceAgentDto>>> GetAgentsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var today = DateTime.UtcNow.Date;

        var agents = await _dbContext.Set<VoiceAgent>()
            .Where(a => a.BusinessId == businessId && a.DeletedAt == null)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new VoiceAgentDto
            {
                Id = a.Id,
                Name = a.Name,
                Role = a.Role,
                VoiceType = a.VoiceType,
                Language = a.Language,
                Personality = a.Personality,
                SpeakingSpeed = a.SpeakingSpeed,
                IsActive = a.IsActive,
                CallsToday = a.Calls.Count(c => c.StartedAt >= today),
                SuccessRate = a.Calls.Count > 0
                    ? Math.Round((decimal)a.Calls.Count(c => c.Outcome == "qualified" || c.Outcome == "appointment_booked") / a.Calls.Count * 100, 1)
                    : 0,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(agents);
    }

    /// <summary>
    /// Gets voice statistics.
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(VoiceStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<VoiceStatsDto>> GetStatsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var calls = await _dbContext.Set<VoiceCall>()
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var activeAgents = await _dbContext.Set<VoiceAgent>()
            .CountAsync(a => a.BusinessId == businessId && a.IsActive && a.DeletedAt == null, cancellationToken);

        var totalSeconds = calls.Sum(c => c.DurationSeconds);
        var avgSeconds = calls.Count > 0 ? totalSeconds / calls.Count : 0;
        var successfulCalls = calls.Count(c => c.Outcome == "qualified" || c.Outcome == "appointment_booked");

        var stats = new VoiceStatsDto
        {
            TotalCalls = calls.Count,
            AverageDuration = FormatDuration(avgSeconds),
            SuccessRate = calls.Count > 0 ? Math.Round((decimal)successfulCalls / calls.Count * 100, 1) : 0,
            MinutesUsed = totalSeconds / 60,
            ActiveAgents = activeAgents
        };

        return Ok(stats);
    }

    /// <summary>
    /// Creates a new voice agent.
    /// </summary>
    [HttpPost]
    [RequiresFeature("ai_voice")] // Requires AI voice feature
    [RequiresLimit("max_ai_voice_agents")] // Enforces agent limit
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(VoiceAgentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<VoiceAgentDto>> CreateAgentAsync(
        [FromBody] CreateVoiceAgentRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var agent = new VoiceAgent
        {
            BusinessId = businessId,
            Name = request.Name,
            Role = request.Role,
            VoiceType = request.VoiceType,
            Language = request.Language,
            Personality = request.Personality,
            SpeakingSpeed = request.SpeakingSpeed,
            Script = string.IsNullOrWhiteSpace(request.Script) ? null : request.Script,
            IsActive = true
        };

        _dbContext.Set<VoiceAgent>().Add(agent);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new VoiceAgentDto
        {
            Id = agent.Id,
            Name = agent.Name,
            Role = agent.Role,
            VoiceType = agent.VoiceType,
            Language = agent.Language,
            Personality = agent.Personality,
            SpeakingSpeed = agent.SpeakingSpeed,
            IsActive = true,
            CallsToday = 0,
            SuccessRate = 0,
            CreatedAt = agent.CreatedAt
        };

        return Created(new Uri($"/api/v1/voice-agents/{agent.Id}", UriKind.Relative), dto);
    }

    /// <summary>
    /// Updates a voice agent.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(VoiceAgentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<VoiceAgentDto>> UpdateAgentAsync(
        Guid id,
        [FromBody] UpdateVoiceAgentRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var today = DateTime.UtcNow.Date;

        var agent = await _dbContext.Set<VoiceAgent>()
            .Include(a => a.Calls)
            .FirstOrDefaultAsync(a => a.Id == id && a.BusinessId == businessId && a.DeletedAt == null, cancellationToken);

        if (agent == null)
        {
            return NotFound();
        }

        if (request.Name != null) agent.Name = request.Name;
        if (request.Role != null) agent.Role = request.Role;
        if (request.VoiceType != null) agent.VoiceType = request.VoiceType;
        if (request.Language != null) agent.Language = request.Language;
        if (request.Personality != null) agent.Personality = request.Personality;
        if (request.SpeakingSpeed.HasValue) agent.SpeakingSpeed = request.SpeakingSpeed.Value;
        if (request.IsActive.HasValue) agent.IsActive = request.IsActive.Value;
        if (request.Script != null) agent.Script = request.Script;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new VoiceAgentDto
        {
            Id = agent.Id,
            Name = agent.Name,
            Role = agent.Role,
            VoiceType = agent.VoiceType,
            Language = agent.Language,
            Personality = agent.Personality,
            SpeakingSpeed = agent.SpeakingSpeed,
            IsActive = agent.IsActive,
            CallsToday = agent.Calls.Count(c => c.StartedAt >= today),
            SuccessRate = agent.Calls.Count > 0
                ? Math.Round((decimal)agent.Calls.Count(c => c.Outcome == "qualified" || c.Outcome == "appointment_booked") / agent.Calls.Count * 100, 1)
                : 0,
            CreatedAt = agent.CreatedAt
        });
    }

    /// <summary>
    /// Deletes a voice agent.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAgentAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var agent = await _dbContext.Set<VoiceAgent>()
            .FirstOrDefaultAsync(a => a.Id == id && a.BusinessId == businessId && a.DeletedAt == null, cancellationToken);

        if (agent == null)
        {
            return NotFound();
        }

        agent.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Gets recent calls for the current business.
    /// </summary>
    [HttpGet("calls")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<VoiceCallDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<VoiceCallDto>>> GetCallsAsync(
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var calls = await _dbContext.Set<VoiceCall>()
            .Include(c => c.VoiceAgent)
            .Where(c => c.BusinessId == businessId && c.DeletedAt == null)
            .OrderByDescending(c => c.StartedAt)
            .Take(limit)
            .Select(c => new VoiceCallDto
            {
                Id = c.Id,
                VoiceAgentId = c.VoiceAgentId,
                AgentName = c.VoiceAgent.Name,
                ContactName = c.ContactName,
                PhoneNumber = c.PhoneNumber,
                Direction = c.Direction,
                Status = c.Status,
                Outcome = c.Outcome,
                DurationSeconds = c.DurationSeconds,
                Duration = FormatDuration(c.DurationSeconds),
                StartedAt = c.StartedAt,
                Transcript = c.Transcript,
                TimeAgo = GetTimeAgo(c.StartedAt)
            })
            .ToListAsync(cancellationToken);

        return Ok(calls);
    }

    private static string FormatDuration(int seconds)
    {
        var minutes = seconds / 60;
        var secs = seconds % 60;
        return $"{minutes}m {secs}s";
    }

    private static string GetTimeAgo(DateTime dateTime)
    {
        var diff = DateTime.UtcNow - dateTime;
        if (diff.TotalMinutes < 1) return "just now";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} mins ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} hours ago";
        return $"{(int)diff.TotalDays} days ago";
    }
}
