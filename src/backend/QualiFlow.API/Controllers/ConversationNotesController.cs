using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.ConversationNotes.DTOs;
using QualiFlow.Application.Features.ConversationNotes.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for conversation note operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/conversations/{conversationId:guid}/notes")]
[Authorize]
[Produces("application/json")]
public class ConversationNotesController : ControllerBase
{
    private readonly IConversationNoteService _noteService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationNotesController"/> class.
    /// </summary>
    /// <param name="noteService">The conversation note service.</param>
    public ConversationNotesController(IConversationNoteService noteService)
    {
        _noteService = noteService;
    }

    /// <summary>
    /// Gets all notes for a conversation.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of conversation notes.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<ConversationNoteResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ConversationNoteResponse>>> GetAllAsync(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var notes = await _noteService.GetByConversationIdAsync(conversationId, cancellationToken);
        return Ok(notes);
    }

    /// <summary>
    /// Gets a note by ID.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation note if found.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(ConversationNoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationNoteResponse>> GetByIdAsync(Guid conversationId, Guid id, CancellationToken cancellationToken)
    {
        var note = await _noteService.GetByIdAsync(id, cancellationToken);
        if (note == null || note.ConversationId != conversationId)
        {
            return NotFound();
        }

        return Ok(note);
    }

    /// <summary>
    /// Creates a new note.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created conversation note.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ConversationNoteResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ConversationNoteResponse>> CreateAsync(
        Guid conversationId,
        [FromBody] CreateConversationNoteRequest request,
        CancellationToken cancellationToken)
    {
        var note = await _noteService.CreateAsync(conversationId, request, cancellationToken);
        return CreatedAtAction(nameof(GetByIdAsync), new { conversationId, id = note.Id }, note);
    }

    /// <summary>
    /// Updates an existing note.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="id">The note ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation note.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(ConversationNoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationNoteResponse>> UpdateAsync(
        Guid conversationId,
        Guid id,
        [FromBody] UpdateConversationNoteRequest request,
        CancellationToken cancellationToken)
    {
        var note = await _noteService.UpdateAsync(id, request, cancellationToken);
        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    /// <summary>
    /// Deletes a note.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid conversationId, Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _noteService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Toggles the pinned status of a note.
    /// </summary>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="id">The note ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation note.</returns>
    [HttpPost("{id:guid}/toggle-pin")]
    [ProducesResponseType(typeof(ConversationNoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationNoteResponse>> TogglePinAsync(Guid conversationId, Guid id, CancellationToken cancellationToken)
    {
        var note = await _noteService.TogglePinAsync(id, cancellationToken);
        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }
}

