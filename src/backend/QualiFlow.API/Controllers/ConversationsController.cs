using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Conversations.DTOs;
using QualiFlow.Application.Features.Conversations.Services;
using QualiFlow.Application.Features.Messages.Services;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for conversation management operations.
/// Provides RESTful endpoints for creating, reading, updating, and deleting conversations.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All operations are automatically filtered by the current user's business ID.
/// - Conversation-Lead relationship: Conversations must belong to a valid lead in the same business.
/// - Channel validation: Only valid communication channels are allowed (chat_widget, sms, voice, whatsapp, instagram, facebook).
/// - Status management: Conversation status can be Open, InProgress, Closed, or Archived.
/// - Soft delete: Deleted conversations are marked with DeletedAt timestamp, not physically removed.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IMessageService _messageService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationsController"/> class.
    /// </summary>
    /// <param name="conversationService">The conversation service for business logic operations.</param>
    /// <param name="messageService">The message service for message-related operations.</param>
    /// <param name="currentUserService">The current user service for accessing authenticated user context.</param>
    public ConversationsController(
        IConversationService conversationService,
        IMessageService messageService,
        ICurrentUserService currentUserService)
    {
        _conversationService = conversationService;
        _messageService = messageService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets a paginated list of conversations for the authenticated user's business with optional filtering.
    /// </summary>
    /// <param name="leadId">Optional lead ID filter. If provided, returns only conversations for that specific lead.</param>
    /// <param name="status">Optional status filter. If provided, returns only conversations with that status.</param>
    /// <param name="channel">Optional channel filter. If provided, returns only conversations from that channel.</param>
    /// <param name="page">Page number (1-based). Default is 1.</param>
    /// <param name="pageSize">Number of items per page (1-100). Default is 10.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A paginated list of conversations with metadata (total count, page info, etc.).</returns>
    /// <response code="200">Returns the paginated list of conversations successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., page &lt; 1, pageSize &gt; 100).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/conversations?leadId=3fa85f64-5717-4562-b3fc-2c963f66afa6&amp;status=Open&amp;channel=chat_widget&amp;page=1&amp;pageSize=10
    ///
    /// This endpoint automatically filters conversations by the authenticated user's business ID (multi-tenancy).
    /// Only conversations belonging to the current user's business will be returned.
    ///
    /// Valid status values: Open, InProgress, Closed, Archived.
    /// Valid channel values: chat_widget, sms, voice, whatsapp, instagram, facebook.
    /// </remarks>
    [HttpGet]
    [NoCache]
    [ProducesResponseType(typeof(PagedConversationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedConversationResponse>> GetConversationsAsync(
        [FromQuery] Guid? leadId = null,
        [FromQuery] ConversationStatus? status = null,
        [FromQuery] string? channel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _conversationService.GetConversationsAsync(
            businessId,
            leadId,
            status,
            channel,
            page,
            pageSize,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets a specific conversation by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the conversation to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The conversation details if found, including message count.</returns>
    /// <response code="200">Returns the conversation successfully.</response>
    /// <response code="404">Conversation not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/conversations/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the conversation exists but belongs to a different business, it will return 404 Not Found.
    /// </remarks>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ConversationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationResponse>> GetConversationAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var conversation = await _conversationService.GetConversationByIdAsync(businessId, id, cancellationToken);

        if (conversation == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found or does not belong to your business.",
            });
        }

        return Ok(conversation);
    }

    /// <summary>
    /// Creates a new conversation in the authenticated user's business.
    /// </summary>
    /// <param name="request">The conversation creation request containing lead ID and channel.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The created conversation with generated ID and timestamps.</returns>
    /// <response code="201">Conversation created successfully. Returns the created conversation and Location header with the conversation's URI.</response>
    /// <response code="400">Invalid request data (validation errors or business rule violations).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/conversations
    ///     {
    ///       "leadId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ///       "channel": "chat_widget",
    ///       "status": "Open"
    ///     }
    ///
    /// The conversation will be automatically assigned to the authenticated user's business (multi-tenancy).
    /// Initial status defaults to "Open" if not provided.
    /// StartedAt is automatically set to the current UTC time.
    ///
    /// Valid channels: chat_widget, sms, voice, whatsapp, instagram, facebook.
    /// Valid status values: Open, InProgress, Closed, Archived.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(ConversationResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationResponse>> CreateConversationAsync(
        [FromBody] CreateConversationRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var conversation = await _conversationService.CreateConversationAsync(businessId, request, cancellationToken);

        // Use explicit URI overload to avoid route generation issues in some hosting/test environments
        return Created(new Uri($"/api/v1/conversations/{conversation.Id}", UriKind.Relative), conversation);
    }

    /// <summary>
    /// Updates an existing conversation with partial data (PATCH operation).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the conversation to update.</param>
    /// <param name="request">The conversation update request. Only provided fields will be updated.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The updated conversation with all current values.</returns>
    /// <response code="200">Conversation updated successfully.</response>
    /// <response code="400">Invalid request data (validation errors or business rule violations).</response>
    /// <response code="404">Conversation not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     PATCH /api/v1/conversations/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///     {
    ///       "status": "Closed",
    ///       "endedAt": "2025-12-03T15:30:00Z"
    ///     }
    ///
    /// This is a PATCH operation - only the fields you provide will be updated.
    /// All other fields will remain unchanged.
    ///
    /// Common use cases:
    /// - Update status to "Closed" when conversation ends (set endedAt to current time).
    /// - Update status to "InProgress" when actively engaging with lead.
    /// - Update status to "Archived" for old conversations.
    ///
    /// Valid status values: Open, InProgress, Closed, Archived.
    /// EndedAt must not be in the future if provided.
    /// </remarks>
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(ConversationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationResponse>> UpdateConversationAsync(
        Guid id,
        [FromBody] UpdateConversationRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var conversation = await _conversationService.UpdateConversationAsync(businessId, id, request, cancellationToken);

        if (conversation == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found or does not belong to your business.",
            });
        }

        return Ok(conversation);
    }

    /// <summary>
    /// Deletes a conversation (soft delete - marks as deleted without physical removal).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the conversation to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>No content on successful deletion.</returns>
    /// <response code="204">Conversation deleted successfully (soft delete - marked with DeletedAt timestamp).</response>
    /// <response code="404">Conversation not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     DELETE /api/v1/conversations/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This is a soft delete operation - the conversation is not physically removed from the database.
    /// Instead, the DeletedAt timestamp is set to the current UTC time.
    ///
    /// Soft-deleted conversations:
    /// - Will not appear in normal queries (filtered by global query filters).
    /// - Can be restored by clearing the DeletedAt timestamp (future feature).
    /// - Are retained for audit and compliance purposes.
    /// - All associated messages are also soft-deleted (cascade behavior).
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the conversation exists but belongs to a different business, it will return 404 Not Found.
    /// </remarks>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteConversationAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var deleted = await _conversationService.DeleteConversationAsync(businessId, id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found or does not belong to your business.",
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Gets the count of unread messages in a conversation for the current user.
    /// </summary>
    /// <param name="id">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The count of unread messages.</returns>
    /// <response code="200">Returns the unread message count successfully.</response>
    /// <response code="404">Conversation not found or does not belong to the user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/conversations/3fa85f64-5717-4562-b3fc-2c963f66afa6/unread-count
    ///
    /// This endpoint returns the count of messages in the conversation that have not been marked as read
    /// by the current user. It's useful for displaying unread message badges in the UI.
    ///
    /// Use cases:
    /// - Display unread message count in conversation list.
    /// - Show notification badges for conversations with unread messages.
    /// - Track which conversations need attention from the current user.
    ///
    /// Note: This count is user-specific. Different users may have different unread counts for the same conversation.
    /// </remarks>
    [HttpGet("{id}/unread-count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<int>> GetUnreadCountAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "User not authenticated",
                Detail = "User ID could not be determined from the authentication token.",
            });
        }

        // First verify the conversation exists and belongs to the business
        var conversation = await _conversationService.GetConversationByIdAsync(businessId, id, cancellationToken);

        if (conversation == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found or does not belong to your business.",
            });
        }

        var unreadCount = await _messageService.GetUnreadCountAsync(businessId, id, userId.Value, cancellationToken);

        return Ok(unreadCount);
    }

    /// <summary>
    /// Gets an enhanced conversation list with last message preview, unread counts, and lead summary.
    /// </summary>
    /// <param name="request">The list request with filters and sorting options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enhanced conversation list with metadata.</returns>
    /// <response code="200">Returns the enhanced conversation list successfully.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/conversations/list?searchTerm=john&amp;status=Open&amp;channel=chat_widget&amp;sortBy=LastMessageAt&amp;sortDirection=Descending&amp;page=1&amp;pageSize=10
    ///
    /// This endpoint provides an enhanced conversation list with:
    /// - Last message preview (truncated to 100 characters)
    /// - Unread message count per conversation for the current user
    /// - Lead summary (name, email, status, score)
    /// - Total unread count across all conversations
    ///
    /// Supported filters:
    /// - searchTerm: Search by lead name or email (case-insensitive)
    /// - status: Filter by conversation status (Open, InProgress, Closed, Archived)
    /// - channel: Filter by communication channel
    /// - dateFrom/dateTo: Filter by creation date range
    ///
    /// Supported sorting:
    /// - LastMessageAt: Sort by last message timestamp (default).
    /// - CreatedAt: Sort by conversation creation date.
    /// - UnreadCount: Sort by unread message count.
    /// </remarks>
    [HttpGet("list")]
    [ProducesResponseType(typeof(ConversationListResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ConversationListResponse>> GetConversationListAsync(
        [FromQuery] ConversationListRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        if (!userId.HasValue)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "User not authenticated",
                Detail = "User ID could not be determined from the authentication token.",
            });
        }

        var result = await _conversationService.GetConversationListAsync(
            businessId,
            userId.Value,
            request,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets the tags for a specific conversation.
    /// </summary>
    /// <param name="id">The conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The conversation's tags.</returns>
    [HttpGet("{id:guid}/tags")]
    [ProducesResponseType(typeof(ConversationTagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationTagsResponse>> GetConversationTags(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var tags = await _conversationService.GetConversationTagsAsync(businessId, id, cancellationToken);
        if (tags == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found.",
            });
        }

        return Ok(tags);
    }

    /// <summary>
    /// Adds tags to a conversation.
    /// </summary>
    /// <param name="id">The conversation ID.</param>
    /// <param name="request">The tags to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation tags.</returns>
    [HttpPost("{id:guid}/tags")]
    [ProducesResponseType(typeof(ConversationTagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationTagsResponse>> AddConversationTags(
        Guid id,
        [FromBody] AddConversationTagsRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _conversationService.AddConversationTagsAsync(
            businessId, id, request.Tags, cancellationToken);

        if (result == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found.",
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Removes tags from a conversation.
    /// </summary>
    /// <param name="id">The conversation ID.</param>
    /// <param name="request">The tags to remove.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated conversation tags.</returns>
    [HttpDelete("{id:guid}/tags")]
    [ProducesResponseType(typeof(ConversationTagsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationTagsResponse>> RemoveConversationTags(
        Guid id,
        [FromBody] RemoveConversationTagsRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _conversationService.RemoveConversationTagsAsync(
            businessId, id, request.Tags, cancellationToken);

        if (result == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Conversation not found",
                Detail = $"Conversation with ID {id} was not found.",
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Gets tag suggestions based on existing tags in the business.
    /// </summary>
    /// <param name="query">Optional search query to filter suggestions.</param>
    /// <param name="limit">Maximum number of suggestions to return (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tag suggestions with usage counts.</returns>
    [HttpGet("tags/suggestions")]
    [ProducesResponseType(typeof(IReadOnlyList<TagSuggestionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TagSuggestionDto>>> GetTagSuggestions(
        [FromQuery] string? query = null,
        [FromQuery] int limit = 20,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var suggestions = await _conversationService.GetTagSuggestionsAsync(
            businessId, query, limit, cancellationToken);

        return Ok(suggestions);
    }
}

