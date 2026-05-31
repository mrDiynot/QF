// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.CallScripts.DTOs;
using QualiFlow.Application.Features.CallScripts.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for call script operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/call-scripts")]
[Authorize]
[Produces("application/json")]
public class CallScriptsController : ControllerBase
{
    private readonly ICallScriptService _scriptService;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="CallScriptsController"/> class.
    /// </summary>
    public CallScriptsController(
        ICallScriptService scriptService,
        ICurrentUserService currentUser)
    {
        _scriptService = scriptService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Creates a new call script.
    /// </summary>
    /// <param name="request">The script creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created script.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CallScriptDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CallScriptDto>> CreateScript(
        [FromBody] CreateCallScriptRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var script = await _scriptService.CreateAsync(businessId, request, cancellationToken);
        return CreatedAtAction(nameof(GetScript), new { id = script.Id }, script);
    }

    /// <summary>
    /// Gets a call script by ID.
    /// </summary>
    /// <param name="id">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The script details.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(CallScriptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallScriptDto>> GetScript(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var script = await _scriptService.GetByIdAsync(businessId, id, cancellationToken);

        if (script == null)
        {
            return NotFound();
        }

        return Ok(script);
    }

    /// <summary>
    /// Gets all call scripts for the business.
    /// </summary>
    /// <param name="includeInactive">Whether to include inactive scripts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of scripts.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<CallScriptDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CallScriptDto>>> GetScripts(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUser.GetBusinessId();
        var scripts = await _scriptService.GetAllAsync(businessId, includeInactive, cancellationToken);
        return Ok(scripts);
    }

    /// <summary>
    /// Gets the default call script for the business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The default script or 404.</returns>
    [HttpGet("default")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(CallScriptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallScriptDto>> GetDefaultScript(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var script = await _scriptService.GetDefaultAsync(businessId, cancellationToken);

        if (script == null)
        {
            return NotFound();
        }

        return Ok(script);
    }

    /// <summary>
    /// Updates a call script.
    /// </summary>
    /// <param name="id">The script ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated script.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CallScriptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CallScriptDto>> UpdateScript(
        Guid id,
        [FromBody] UpdateCallScriptRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var script = await _scriptService.UpdateAsync(businessId, id, request, cancellationToken);

        if (script == null)
        {
            return NotFound();
        }

        return Ok(script);
    }

    /// <summary>
    /// Sets a script as the default for the business.
    /// </summary>
    /// <param name="id">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpPost("{id:guid}/set-default")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetAsDefault(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var success = await _scriptService.SetAsDefaultAsync(businessId, id, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Deletes a call script.
    /// </summary>
    /// <param name="id">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteScript(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var success = await _scriptService.DeleteAsync(businessId, id, cancellationToken);

        if (!success)
        {
            return NotFound();
        }

        return NoContent();
    }
}

