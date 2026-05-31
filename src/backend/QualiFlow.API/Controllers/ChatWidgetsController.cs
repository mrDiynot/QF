// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.ChatWidgets.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for managing chat widget configurations.
/// Requires Admin or Owner role for all operations (widget configuration impacts lead capture).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/chat-widgets")]
[Authorize(Policy = BusinessPolicies.RequireAdminOrOwner)]
[Produces("application/json")]
public class ChatWidgetsController : ControllerBase
{
    private readonly IChatWidgetService _widgetService;
    private readonly ICurrentUserService _currentUser;

    /// <summary>
    /// Initializes a new instance of the <see cref="ChatWidgetsController"/> class.
    /// </summary>
    /// <param name="widgetService">Chat widget service.</param>
    /// <param name="currentUser">Current user service.</param>
    public ChatWidgetsController(
        IChatWidgetService widgetService,
        ICurrentUserService currentUser)
    {
        _widgetService = widgetService;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Gets all chat widgets for the current business.
    /// </summary>
    /// <param name="isActive">Filter by active status.</param>
    /// <param name="skip">Number of items to skip.</param>
    /// <param name="take">Number of items to take.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of chat widgets.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<ChatWidgetDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ChatWidgetDto>>> GetAll(
        [FromQuery] bool? isActive = null,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUser.GetBusinessId();
        var widgets = await _widgetService.GetAllAsync(businessId, isActive, skip, take, cancellationToken);
        return Ok(widgets);
    }

    /// <summary>
    /// Gets a specific chat widget by ID.
    /// </summary>
    /// <param name="id">Widget ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The chat widget.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.LongTerm, "Authorization")]
    [ProducesResponseType(typeof(ChatWidgetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatWidgetDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var widget = await _widgetService.GetByIdAsync(businessId, id, cancellationToken);
        if (widget == null)
        {
            return NotFound();
        }

        return Ok(widget);
    }

    /// <summary>
    /// Creates a new chat widget.
    /// </summary>
    /// <param name="request">Create request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created widget.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ChatWidgetDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChatWidgetDto>> Create(
        [FromBody] CreateChatWidgetRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var widget = await _widgetService.CreateAsync(businessId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = widget.Id }, widget);
    }

    /// <summary>
    /// Updates an existing chat widget.
    /// </summary>
    /// <param name="id">Widget ID.</param>
    /// <param name="request">Update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated widget.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ChatWidgetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatWidgetDto>> Update(
        Guid id,
        [FromBody] UpdateChatWidgetRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var widget = await _widgetService.UpdateAsync(businessId, id, request, cancellationToken);
        if (widget == null)
        {
            return NotFound();
        }

        return Ok(widget);
    }

    /// <summary>
    /// Deletes a chat widget.
    /// </summary>
    /// <param name="id">Widget ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var result = await _widgetService.DeleteAsync(businessId, id, cancellationToken);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Gets the embed code for a chat widget.
    /// </summary>
    /// <param name="id">Widget ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The embed code HTML.</returns>
    [HttpGet("{id:guid}/embed-code")]
    [ProducesResponseType(typeof(EmbedCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmbedCodeResponse>> GetEmbedCode(Guid id, CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var embedCode = await _widgetService.GetEmbedCodeAsync(businessId, id, cancellationToken);
        if (embedCode == null)
        {
            return NotFound();
        }

        return Ok(new EmbedCodeResponse { EmbedCode = embedCode });
    }
}

/// <summary>
/// Response containing embed code.
/// </summary>
public record EmbedCodeResponse
{
    /// <summary>
    /// Gets the HTML embed code.
    /// </summary>
    public string EmbedCode { get; init; } = string.Empty;
}

