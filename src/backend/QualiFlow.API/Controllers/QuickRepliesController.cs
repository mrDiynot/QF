using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.QuickReplies.DTOs;
using QualiFlow.Application.Features.QuickReplies.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for quick reply operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
[Produces("application/json")]
public class QuickRepliesController : ControllerBase
{
    private readonly IQuickReplyService _quickReplyService;

    /// <summary>
    /// Initializes a new instance of the <see cref="QuickRepliesController"/> class.
    /// </summary>
    /// <param name="quickReplyService">The quick reply service.</param>
    public QuickRepliesController(IQuickReplyService quickReplyService)
    {
        _quickReplyService = quickReplyService;
    }

    /// <summary>
    /// Gets all quick replies for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of quick replies.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<QuickReplyResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<QuickReplyResponse>>> GetAllAsync(
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        var quickReplies = await _quickReplyService.GetAllAsync(category, cancellationToken);
        return Ok(quickReplies);
    }

    /// <summary>
    /// Gets a quick reply by ID.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply if found.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(QuickReplyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuickReplyResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var quickReply = await _quickReplyService.GetByIdAsync(id, cancellationToken);
        if (quickReply == null)
        {
            return NotFound();
        }

        return Ok(quickReply);
    }

    /// <summary>
    /// Gets a quick reply by shortcut.
    /// </summary>
    /// <param name="shortcut">The shortcut trigger.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply if found.</returns>
    [HttpGet("shortcut/{shortcut}")]
    [ProducesResponseType(typeof(QuickReplyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuickReplyResponse>> GetByShortcutAsync(string shortcut, CancellationToken cancellationToken)
    {
        var quickReply = await _quickReplyService.GetByShortcutAsync(shortcut, cancellationToken);
        if (quickReply == null)
        {
            return NotFound();
        }

        return Ok(quickReply);
    }

    /// <summary>
    /// Creates a new quick reply.
    /// </summary>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created quick reply.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(QuickReplyResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<QuickReplyResponse>> CreateAsync(
        [FromBody] CreateQuickReplyRequest request,
        CancellationToken cancellationToken)
    {
        var quickReply = await _quickReplyService.CreateAsync(request, cancellationToken);
        return Created(new Uri($"/api/v1/QuickReplies/{quickReply.Id}", UriKind.Relative), quickReply);
    }

    /// <summary>
    /// Updates an existing quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated quick reply.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(QuickReplyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QuickReplyResponse>> UpdateAsync(
        Guid id,
        [FromBody] UpdateQuickReplyRequest request,
        CancellationToken cancellationToken)
    {
        var quickReply = await _quickReplyService.UpdateAsync(id, request, cancellationToken);
        if (quickReply == null)
        {
            return NotFound();
        }

        return Ok(quickReply);
    }

    /// <summary>
    /// Deletes a quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _quickReplyService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Records usage of a quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("{id:guid}/usage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecordUsageAsync(Guid id, CancellationToken cancellationToken)
    {
        await _quickReplyService.RecordUsageAsync(id, cancellationToken);
        return NoContent();
    }
}

