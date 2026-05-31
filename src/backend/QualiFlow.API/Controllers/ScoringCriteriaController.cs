// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.ScoringCriteria.DTOs;
using QualiFlow.Application.Features.ScoringCriteria.Services;

#pragma warning disable CA1062 // Validate arguments of public methods - handled by ASP.NET Core model binding

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for managing scoring criteria.
/// Provides CRUD operations for configurable lead qualification criteria.
/// Requires Admin or Owner role for all operations (scoring criteria is a business configuration).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/scoring-criteria")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireAdminOrOwner)]
[Produces("application/json")]
public class ScoringCriteriaController : ControllerBase
{
    private readonly IScoringCriteriaService _scoringCriteriaService;

    /// <summary>Initializes a new instance of the <see cref="ScoringCriteriaController"/> class.</summary>
    /// <param name="scoringCriteriaService">The scoring criteria service.</param>
    public ScoringCriteriaController(IScoringCriteriaService scoringCriteriaService)
    {
        _scoringCriteriaService = scoringCriteriaService;
    }

    /// <summary>Gets all scoring criteria for the current business.</summary>
    /// <param name="includeInactive">Include inactive criteria in the response.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of scoring criteria with summary information.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(ScoringCriteriaListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringCriteriaListResponse>> GetAllAsync(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _scoringCriteriaService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(result);
    }

    /// <summary>Gets a scoring criterion by ID.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring criterion if found.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(ScoringCriteriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ScoringCriteriaResponse>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await _scoringCriteriaService.GetByIdAsync(id, cancellationToken);

        if (result == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Scoring criterion not found",
                Detail = $"Scoring criterion with ID {id} was not found.",
            });
        }

        return Ok(result);
    }

    /// <summary>Creates a new scoring criterion.</summary>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created scoring criterion.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ScoringCriteriaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ScoringCriteriaResponse>> CreateAsync(
        [FromBody] CreateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _scoringCriteriaService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Duplicate criterion",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>Updates an existing scoring criterion.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated scoring criterion.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(ScoringCriteriaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ScoringCriteriaResponse>> UpdateAsync(
        Guid id,
        [FromBody] UpdateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _scoringCriteriaService.UpdateAsync(id, request, cancellationToken);

            if (result == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Scoring criterion not found",
                    Detail = $"Scoring criterion with ID {id} was not found.",
                });
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Duplicate criterion",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>Deletes a scoring criterion.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var deleted = await _scoringCriteriaService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Scoring criterion not found",
                Detail = $"Scoring criterion with ID {id} was not found.",
            });
        }

        return NoContent();
    }

    /// <summary>Validates that the weights of all active criteria sum to 100.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Validation result.</returns>
    [HttpGet("validate-weights")]
    [ProducesResponseType(typeof(WeightValidationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WeightValidationResponse>> ValidateWeightsAsync(
        CancellationToken cancellationToken = default)
    {
        var isValid = await _scoringCriteriaService.ValidateWeightsAsync(cancellationToken);
        return Ok(new WeightValidationResponse(isValid));
    }
}
