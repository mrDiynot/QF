// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.ChatWidgets.DTOs;
using QualiFlow.Application.Features.ChatWidgets.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Public API controller for chat widget sessions.
/// Does NOT require authentication - used by embedded widgets.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/public/chat")]
[AllowAnonymous]
[Produces("application/json")]
public class PublicChatController : ControllerBase
{
    private readonly IChatWidgetService _widgetService;
    private readonly IChatSessionService _sessionService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublicChatController"/> class.
    /// </summary>
    /// <param name="widgetService">Chat widget service.</param>
    /// <param name="sessionService">Chat session service.</param>
    public PublicChatController(
        IChatWidgetService widgetService,
        IChatSessionService sessionService)
    {
        _widgetService = widgetService;
        _sessionService = sessionService;
    }

    /// <summary>
    /// Gets the public configuration for a chat widget.
    /// </summary>
    /// <param name="widgetKey">The widget's unique key.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Public widget configuration.</returns>
    [HttpGet("widget/{widgetKey}")]
    [CacheControl(CacheStrategies.LongTerm)]
    [ProducesResponseType(typeof(PublicChatWidgetConfigDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicChatWidgetConfigDto>> GetWidgetConfig(
        string widgetKey,
        CancellationToken cancellationToken)
    {
        var config = await _widgetService.GetPublicConfigAsync(widgetKey, cancellationToken);
        if (config == null)
        {
            return NotFound();
        }

        return Ok(config);
    }

    /// <summary>
    /// Starts a new chat session.
    /// </summary>
    /// <param name="request">Start session request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Session details with token.</returns>
    [HttpPost("sessions")]
    [ProducesResponseType(typeof(StartChatSessionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StartChatSessionResponse>> StartSession(
        [FromBody] StartChatSessionRequest request,
        CancellationToken cancellationToken)
    {
        // Capture visitor info from request
        request = request with
        {
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
        };

        var response = await _sessionService.StartSessionAsync(request, cancellationToken);
        if (response == null)
        {
            return NotFound("Widget not found or inactive");
        }

        return CreatedAtAction(nameof(GetSession), new { sessionToken = response.SessionToken }, response);
    }

    /// <summary>
    /// Gets session details by token.
    /// </summary>
    /// <param name="sessionToken">The session token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Session details.</returns>
    [HttpGet("sessions/{sessionToken}")]
    [CacheControl(CacheStrategies.ShortTerm)]
    [ProducesResponseType(typeof(ChatSessionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatSessionDto>> GetSession(
        string sessionToken,
        CancellationToken cancellationToken)
    {
        var session = await _sessionService.GetBySessionTokenAsync(sessionToken, cancellationToken);
        if (session == null)
        {
            return NotFound();
        }

        return Ok(session);
    }

    /// <summary>
    /// Sends a message in a chat session.
    /// </summary>
    /// <param name="sessionToken">The session token.</param>
    /// <param name="request">Send message request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The sent message.</returns>
    [HttpPost("sessions/{sessionToken}/messages")]
    [ProducesResponseType(typeof(ChatMessageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChatMessageDto>> SendMessage(
        string sessionToken,
        [FromBody] SendChatMessageRequest request,
        CancellationToken cancellationToken)
    {
        request = request with { SessionToken = sessionToken };
        var message = await _sessionService.SendMessageAsync(request, cancellationToken);
        if (message == null)
        {
            return NotFound("Session not found or ended");
        }

        return CreatedAtAction(nameof(GetMessages), new { sessionToken }, message);
    }

    /// <summary>
    /// Gets messages for a session.
    /// </summary>
    /// <param name="sessionToken">The session token.</param>
    /// <param name="skip">Number of messages to skip.</param>
    /// <param name="take">Number of messages to take.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of messages.</returns>
    [HttpGet("sessions/{sessionToken}/messages")]
    [CacheControl(CacheStrategies.NoCache)]
    [ProducesResponseType(typeof(IReadOnlyList<ChatMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ChatMessageDto>>> GetMessages(
        string sessionToken,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var messages = await _sessionService.GetMessagesAsync(sessionToken, skip, take, cancellationToken);
        if (messages == null)
        {
            return NotFound();
        }

        return Ok(messages);
    }

    /// <summary>
    /// Ends a chat session.
    /// </summary>
    /// <param name="request">End session request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPost("sessions/end")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> EndSession(
        [FromBody] EndChatSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sessionService.EndSessionAsync(request, cancellationToken);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}

