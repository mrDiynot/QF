using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.CRM.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing CRM deals and sales pipeline.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/deals")]
[Authorize]
public partial class DealsController(
    IDealService dealService,
    ILogger<DealsController> logger) : ControllerBase
{
    /// <summary>
    /// Gets all deals for the current business.
    /// </summary>
    /// <param name="stage">Optional stage filter.</param>
    /// <param name="contactId">Optional contact filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of deals.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<Deal>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<Deal>>> GetAllDealsAsync(
        [FromQuery] DealStage? stage,
        [FromQuery] Guid? contactId,
        [FromQuery] Guid? assignedToUserId,
        CancellationToken cancellationToken)
    {
        LogGettingAllDeals(stage, contactId, assignedToUserId);

        var deals = await dealService.GetAllAsync(stage, contactId, assignedToUserId, cancellationToken);

        return Ok(deals);
    }

    /// <summary>
    /// Gets a deal by ID.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The deal.</returns>
    [HttpGet("{id}")]
    [CacheControl(60, "Authorization")] // Cache for 1 minute per user
    [ProducesResponseType(typeof(Deal), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Deal>> GetDealByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogGettingDeal(id);

        var deal = await dealService.GetByIdAsync(id, cancellationToken);

        if (deal == null)
        {
            return NotFound($"Deal with ID {id} not found");
        }

        return Ok(deal);
    }

    /// <summary>
    /// Gets the sales pipeline (all open deals).
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The pipeline deals.</returns>
    [HttpGet("pipeline")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")] // Pipeline aggregation view
    [ProducesResponseType(typeof(IEnumerable<Deal>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<Deal>>> GetPipelineAsync(
        CancellationToken cancellationToken)
    {
        LogGettingPipeline();

        var deals = await dealService.GetPipelineAsync(cancellationToken);

        return Ok(deals);
    }

    /// <summary>
    /// Gets deals by stage.
    /// </summary>
    /// <param name="stage">The stage.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The deals in the specified stage.</returns>
    [HttpGet("stage/{stage}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<Deal>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<Deal>>> GetDealsByStageAsync(
        DealStage stage,
        CancellationToken cancellationToken)
    {
        LogGettingDealsByStage(stage);

        var deals = await dealService.GetByStageAsync(stage, cancellationToken);

        return Ok(deals);
    }

    /// <summary>
    /// Creates a new deal.
    /// </summary>
    /// <param name="deal">The deal to create.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created deal.</returns>
    [HttpPost]
    [NoCache] // State change - never cache
    [ProducesResponseType(typeof(Deal), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Deal>> CreateDealAsync(
        [FromBody] Deal deal,
        CancellationToken cancellationToken)
    {
        LogCreatingDeal(deal.Title);

        try
        {
            var created = await dealService.CreateAsync(deal, cancellationToken);

            return CreatedAtAction(
                nameof(GetDealByIdAsync),
                new { id = created.Id },
                created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Updates an existing deal.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="deal">The updated deal data.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated deal.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Deal), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Deal>> UpdateDealAsync(
        Guid id,
        [FromBody] Deal deal,
        CancellationToken cancellationToken)
    {
        if (id != deal.Id)
        {
            return BadRequest("Deal ID mismatch");
        }

        LogUpdatingDeal(id);

        try
        {
            var updated = await dealService.UpdateAsync(deal, cancellationToken);

            return Ok(updated);
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound($"Deal with ID {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Moves a deal to a different stage.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="request">The move request containing new stage and optional loss reason.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated deal.</returns>
    [HttpPatch("{id}/move")]
    [ProducesResponseType(typeof(Deal), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Deal>> MoveDealToStageAsync(
        Guid id,
        [FromBody] MoveDealRequest request,
        CancellationToken cancellationToken)
    {
        LogMovingDeal(id, request.NewStage);

        try
        {
            var updated = await dealService.MoveToStageAsync(id, request.NewStage, request.LossReason, cancellationToken);

            return Ok(updated);
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound($"Deal with ID {id} not found");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// Deletes a deal.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDealAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        LogDeletingDeal(id);

        try
        {
            await dealService.DeleteAsync(id, cancellationToken);

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return NotFound($"Deal with ID {id} not found");
        }
    }

    /// <summary>
    /// Gets pipeline analytics.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The pipeline analytics.</returns>
    [HttpGet("analytics/pipeline")]
    [ProducesResponseType(typeof(PipelineAnalytics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PipelineAnalytics>> GetPipelineAnalyticsAsync(
        CancellationToken cancellationToken)
    {
        LogGettingPipelineAnalytics();

        var totalValue = await dealService.GetTotalPipelineValueAsync(cancellationToken);
        var weightedValue = await dealService.GetWeightedPipelineValueAsync(cancellationToken);
        var winRate = await dealService.GetWinRateAsync(cancellationToken);

        var analytics = new PipelineAnalytics
        {
            TotalPipelineValue = totalValue,
            WeightedPipelineValue = weightedValue,
            WinRate = winRate
        };

        return Ok(analytics);
    }

    // ============================================================================
    // LoggerMessage Source Generators
    // ============================================================================

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting all deals with stage={Stage}, contactId={ContactId}, assignedTo={AssignedToUserId}")]
    private partial void LogGettingAllDeals(DealStage? stage, Guid? contactId, Guid? assignedToUserId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deal {DealId}")]
    private partial void LogGettingDeal(Guid dealId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting pipeline")]
    private partial void LogGettingPipeline();

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting deals by stage {Stage}")]
    private partial void LogGettingDealsByStage(DealStage stage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating deal: {Title}")]
    private partial void LogCreatingDeal(string title);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating deal {DealId}")]
    private partial void LogUpdatingDeal(Guid dealId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Moving deal {DealId} to stage {NewStage}")]
    private partial void LogMovingDeal(Guid dealId, DealStage newStage);

    [LoggerMessage(Level = LogLevel.Information, Message = "Deleting deal {DealId}")]
    private partial void LogDeletingDeal(Guid dealId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting pipeline analytics")]
    private partial void LogGettingPipelineAnalytics();
}
