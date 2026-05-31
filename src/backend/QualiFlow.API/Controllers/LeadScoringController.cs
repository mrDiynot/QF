// -----------------------------------------------------------------------
// <copyright file="LeadScoringController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Scoring.DTOs;
using QualiFlow.Application.Features.Scoring.Interfaces;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for lead scoring operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class LeadScoringController : ControllerBase
{
    private readonly ILeadScoringService _scoringService;
    private readonly IBantExtractionService _bantService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="LeadScoringController"/> class.
    /// </summary>
    public LeadScoringController(
        ILeadScoringService scoringService,
        IBantExtractionService bantService,
        ICurrentUserService currentUserService)
    {
        _scoringService = scoringService;
        _bantService = bantService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets the score history for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="limit">Maximum number of history entries to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The score history for the lead.</returns>
    [HttpGet("{leadId}/history")]
    [ProducesResponseType(typeof(IReadOnlyList<ScoreHistoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ScoreHistoryDto>>> GetScoreHistory(
        Guid leadId,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var history = await _scoringService.GetScoreHistoryAsync(leadId, businessId.Value, limit, cancellationToken);
        return Ok(history);
    }

    /// <summary>
    /// Recalculates the score for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The new score result.</returns>
    [HttpPost("{leadId}/recalculate")]
    [ProducesResponseType(typeof(LeadScoreResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadScoreResult>> RecalculateScore(
        Guid leadId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var result = await _scoringService.RecalculateScoreAsync(leadId, businessId.Value, "ManualRecalculation", cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Extracts BANT signals from a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The BANT extraction result.</returns>
    [HttpGet("bant/{conversationId}")]
    [ProducesResponseType(typeof(BantExtractionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BantExtractionResult>> ExtractBant(
        Guid conversationId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var result = await _bantService.ExtractBantFromConversationAsync(businessId.Value, conversationId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets the current scoring configuration.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring configuration.</returns>
    [HttpGet("configuration")]
    [ProducesResponseType(typeof(ScoringConfiguration), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringConfiguration>> GetConfiguration(CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.TryGetBusinessId();
        if (businessId == null)
        {
            return Unauthorized("Business context not found");
        }

        var config = await _scoringService.GetScoringConfigurationAsync(businessId.Value, cancellationToken);
        return Ok(config);
    }
}
