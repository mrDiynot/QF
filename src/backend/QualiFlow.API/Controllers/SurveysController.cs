// <copyright file="SurveysController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

#pragma warning disable SA1615 // Element return value should be documented
#pragma warning disable SA1503 // Braces should not be omitted
#pragma warning disable SA1407 // Arithmetic expressions should declare precedence
#pragma warning disable CA2234 // Pass system uri objects instead of strings

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Surveys.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for survey operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/surveys")]
[Authorize(AuthenticationSchemes = "Bearer")]
[Produces("application/json")]
public class SurveysController : ControllerBase
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public SurveysController(
        QualiFlowDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets all surveys for the current business.
    /// </summary>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<SurveyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SurveyDto>>> GetSurveysAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var surveys = await _dbContext.Set<Survey>()
            .Where(s => s.BusinessId == businessId && s.DeletedAt == null)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SurveyDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Status = s.Status,
                Questions = s.Questions,
                ResponseCount = s.ResponseCount,
                AverageScore = s.AverageScore,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(surveys);
    }

    /// <summary>
    /// Gets survey statistics.
    /// </summary>
    [HttpGet("stats")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(SurveyStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<SurveyStatsDto>> GetStatsAsync(CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var surveys = await _dbContext.Set<Survey>()
            .Where(s => s.BusinessId == businessId && s.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var stats = new SurveyStatsDto
        {
            TotalSurveys = surveys.Count,
            TotalResponses = surveys.Sum(s => s.ResponseCount),
            PublishedSurveys = surveys.Count(s => s.Status == "published"),
            DraftSurveys = surveys.Count(s => s.Status == "draft")
        };

        return Ok(stats);
    }

    /// <summary>
    /// Gets a survey by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SurveyDto>> GetSurveyAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var survey = await _dbContext.Set<Survey>()
            .Where(s => s.Id == id && s.BusinessId == businessId && s.DeletedAt == null)
            .Select(s => new SurveyDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Status = s.Status,
                Questions = s.Questions,
                ResponseCount = s.ResponseCount,
                AverageScore = s.AverageScore,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (survey == null)
        {
            return NotFound();
        }

        return Ok(survey);
    }

    /// <summary>
    /// Creates a new survey.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<SurveyDto>> CreateSurveyAsync(
        [FromBody] CreateSurveyRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var survey = new Survey
        {
            BusinessId = businessId,
            Name = request.Name,
            Description = request.Description,
            Questions = request.Questions,
            Status = "draft",
            IsActive = true
        };

        _dbContext.Set<Survey>().Add(survey);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new SurveyDto
        {
            Id = survey.Id,
            Name = survey.Name,
            Description = survey.Description,
            Status = survey.Status,
            Questions = survey.Questions,
            ResponseCount = 0,
            AverageScore = null,
            IsActive = true,
            CreatedAt = survey.CreatedAt,
            UpdatedAt = survey.UpdatedAt
        };

        return CreatedAtAction(nameof(GetSurveyAsync), new { id = survey.Id }, dto);
    }

    /// <summary>
    /// Updates a survey.
    /// </summary>
    [HttpPatch("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(SurveyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SurveyDto>> UpdateSurveyAsync(
        Guid id,
        [FromBody] UpdateSurveyRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var survey = await _dbContext.Set<Survey>()
            .FirstOrDefaultAsync(s => s.Id == id && s.BusinessId == businessId && s.DeletedAt == null, cancellationToken);

        if (survey == null)
        {
            return NotFound();
        }

        if (request.Name != null) survey.Name = request.Name;
        if (request.Description != null) survey.Description = request.Description;
        if (request.Status != null) survey.Status = request.Status;
        if (request.Questions != null) survey.Questions = request.Questions;
        if (request.IsActive.HasValue) survey.IsActive = request.IsActive.Value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new SurveyDto
        {
            Id = survey.Id,
            Name = survey.Name,
            Description = survey.Description,
            Status = survey.Status,
            Questions = survey.Questions,
            ResponseCount = survey.ResponseCount,
            AverageScore = survey.AverageScore,
            IsActive = survey.IsActive,
            CreatedAt = survey.CreatedAt,
            UpdatedAt = survey.UpdatedAt
        });
    }

    /// <summary>
    /// Deletes a survey.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSurveyAsync(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var survey = await _dbContext.Set<Survey>()
            .FirstOrDefaultAsync(s => s.Id == id && s.BusinessId == businessId && s.DeletedAt == null, cancellationToken);

        if (survey == null)
        {
            return NotFound();
        }

        survey.DeletedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Gets responses for a survey.
    /// </summary>
    [HttpGet("{id:guid}/responses")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(IEnumerable<SurveyResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<SurveyResponseDto>>> GetResponsesAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Verify survey belongs to business
        var surveyExists = await _dbContext.Set<Survey>()
            .AnyAsync(s => s.Id == id && s.BusinessId == businessId && s.DeletedAt == null, cancellationToken);

        if (!surveyExists)
        {
            return NotFound();
        }

        var responses = await _dbContext.Set<SurveyResponse>()
            .Where(r => r.SurveyId == id && r.DeletedAt == null)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new SurveyResponseDto
            {
                Id = r.Id,
                SurveyId = r.SurveyId,
                Email = r.Email,
                Answers = r.Answers,
                Score = r.Score,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(responses);
    }

    /// <summary>
    /// Submits a response to a survey (public endpoint).
    /// </summary>
    [HttpPost("{id:guid}/responses")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(SurveyResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SurveyResponseDto>> SubmitResponseAsync(
        Guid id,
        [FromBody] SubmitSurveyResponseRequest request,
        CancellationToken cancellationToken)
    {
        var survey = await _dbContext.Set<Survey>()
            .FirstOrDefaultAsync(s => s.Id == id && s.Status == "published" && s.IsActive && s.DeletedAt == null, cancellationToken);

        if (survey == null)
        {
            return NotFound();
        }

        var response = new SurveyResponse
        {
            SurveyId = id,
            Email = request.Email,
            Answers = request.Answers,
            Score = request.Score,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        _dbContext.Set<SurveyResponse>().Add(response);

        // Update survey stats
        survey.ResponseCount++;
        if (request.Score.HasValue)
        {
            var totalScore = (survey.AverageScore ?? 0) * (survey.ResponseCount - 1) + request.Score.Value;
            survey.AverageScore = totalScore / survey.ResponseCount;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Created(string.Empty, new SurveyResponseDto
        {
            Id = response.Id,
            SurveyId = response.SurveyId,
            Email = response.Email,
            Answers = response.Answers,
            Score = response.Score,
            CreatedAt = response.CreatedAt
        });
    }

    /// <summary>
    /// Gets analytics for a survey including response breakdown and NPS score.
    /// </summary>
    [HttpGet("{id:guid}/analytics")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
    [ProducesResponseType(typeof(SurveyAnalyticsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SurveyAnalyticsDto>> GetAnalyticsAsync(
        Guid id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var survey = await _dbContext.Set<Survey>()
            .FirstOrDefaultAsync(s => s.Id == id && s.BusinessId == businessId && s.DeletedAt == null, cancellationToken);

        if (survey == null)
        {
            return NotFound();
        }

        // Build query for responses
        var responsesQuery = _dbContext.Set<SurveyResponse>()
            .Where(r => r.SurveyId == id && r.DeletedAt == null);

        if (from.HasValue)
            responsesQuery = responsesQuery.Where(r => r.CreatedAt >= from.Value);
        if (to.HasValue)
            responsesQuery = responsesQuery.Where(r => r.CreatedAt <= to.Value);

        var responses = await responsesQuery.ToListAsync(cancellationToken);

        // Calculate NPS (Net Promoter Score) if scores are available
        double? npsScore = null;
        var scoredResponses = responses.Where(r => r.Score.HasValue).ToList();
        if (scoredResponses.Count > 0)
        {
            var promoters = scoredResponses.Count(r => r.Score >= 9);
            var detractors = scoredResponses.Count(r => r.Score <= 6);
            npsScore = ((double)(promoters - detractors) / scoredResponses.Count) * 100;
        }

        // Calculate response timeline (responses per day)
        var timeline = responses
            .GroupBy(r => r.CreatedAt.Date)
            .OrderBy(g => g.Key)
            .Select(g => new ResponseTimelineEntry
            {
                Date = g.Key,
                Count = g.Count()
            })
            .ToList();

        // Calculate completion rate
        var completionRate = survey.ResponseCount > 0
            ? (double)responses.Count(r => !string.IsNullOrEmpty(r.Answers)) / survey.ResponseCount * 100
            : 0;

        var analytics = new SurveyAnalyticsDto
        {
            SurveyId = id,
            SurveyName = survey.Name,
            TotalResponses = responses.Count,
            AverageScore = scoredResponses.Count > 0 ? (double)scoredResponses.Average(r => r.Score!.Value) : null,
            NpsScore = npsScore,
            CompletionRate = completionRate,
            ResponseTimeline = timeline,
            ScoreDistribution = new ScoreDistributionDto
            {
                Promoters = scoredResponses.Count(r => r.Score >= 9),
                Passives = scoredResponses.Count(r => r.Score >= 7 && r.Score <= 8),
                Detractors = scoredResponses.Count(r => r.Score <= 6)
            }
        };

        return Ok(analytics);
    }
}
