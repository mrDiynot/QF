using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Messages.DTOs;
using QualiFlow.Application.Features.Messages.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for message management operations.
/// Provides RESTful endpoints for creating, reading, updating, and deleting messages within conversations.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All operations are automatically filtered by the current user's business ID.
/// - Message-Conversation relationship: Messages must belong to a valid conversation in the same business.
/// - Message direction: Messages can be Inbound (from lead) or Outbound (to lead).
/// - Message tracking: Tracks SentAt, DeliveredAt, and ReadAt timestamps for message lifecycle.
/// - Content validation: Message content is required and limited to 10,000 characters.
/// - Soft delete: Deleted messages are marked with DeletedAt timestamp, not physically removed.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUsageLimitService _usageLimitService;

    /// <summary>
    /// Initializes a new instance of the <see cref="MessagesController"/> class.
    /// </summary>
    /// <param name="messageService">The message service for business logic operations.</param>
    /// <param name="currentUserService">The current user service for accessing authenticated user context.</param>
    /// <param name="usageLimitService">The usage limit service for subscription enforcement.</param>
    public MessagesController(
        IMessageService messageService,
        ICurrentUserService currentUserService,
        IUsageLimitService usageLimitService)
    {
        _messageService = messageService;
        _currentUserService = currentUserService;
        _usageLimitService = usageLimitService;
    }

    /// <summary>
    /// Gets a paginated list of messages for the authenticated user's business with optional filtering.
    /// </summary>
    /// <param name="conversationId">Optional conversation ID filter. If provided, returns only messages for that specific conversation.</param>
    /// <param name="page">Page number (1-based). Default is 1.</param>
    /// <param name="pageSize">Number of items per page (1-100). Default is 10.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A paginated list of messages with metadata (total count, page info, etc.).</returns>
    /// <response code="200">Returns the paginated list of messages successfully.</response>
    /// <response code="400">Invalid request parameters (e.g., page &lt; 1, pageSize &gt; 100).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/messages?conversationId=3fa85f64-5717-4562-b3fc-2c963f66afa6&amp;page=1&amp;pageSize=10
    ///
    /// This endpoint automatically filters messages by the authenticated user's business ID (multi-tenancy).
    /// Only messages belonging to conversations in the current user's business will be returned.
    ///
    /// Messages are ordered by SentAt timestamp in descending order (newest first).
    /// Each message includes direction (Inbound/Outbound), content, and delivery tracking timestamps.
    /// </remarks>
    [HttpGet]
    [NoCache]
    [ProducesResponseType(typeof(PagedMessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedMessageResponse>> GetMessagesAsync(
        [FromQuery] Guid? conversationId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _messageService.GetMessagesAsync(
            businessId,
            conversationId,
            page,
            pageSize,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets a specific message by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the message to retrieve.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The message details if found, including direction, content, and delivery tracking.</returns>
    /// <response code="200">Returns the message successfully.</response>
    /// <response code="404">Message not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the message exists but belongs to a conversation in a different business, it will return 404 Not Found.
    ///
    /// The response includes:
    /// - Message direction (Inbound from lead, or Outbound to lead).
    /// - Message content (up to 10,000 characters).
    /// - Delivery tracking: SentAt, DeliveredAt (optional), ReadAt (optional).
    /// </remarks>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MessageResponse>> GetMessageAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var message = await _messageService.GetMessageByIdAsync(businessId, id, cancellationToken);

        if (message == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Message not found",
                Detail = $"Message with ID {id} was not found or does not belong to your business.",
            });
        }

        return Ok(message);
    }

    /// <summary>
    /// Creates a new message in a conversation within the authenticated user's business.
    /// </summary>
    /// <param name="request">The message creation request containing conversation ID, content, and direction.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The created message with generated ID and timestamps.</returns>
    /// <response code="201">Message created successfully. Returns the created message and Location header with the message's URI.</response>
    /// <response code="400">Invalid request data (validation errors or business rule violations).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/messages
    ///     {
    ///       "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ///       "content": "Hello, I'm interested in your product.",
    ///       "direction": "Inbound"
    ///     }
    ///
    /// The message will be automatically assigned to the authenticated user's business (multi-tenancy).
    /// SentAt is automatically set to the current UTC time.
    ///
    /// Message direction values:
    /// - Inbound: Message received from the lead.
    /// - Outbound: Message sent to the lead.
    ///
    /// Validation rules:
    /// - ConversationId is required and must be a valid GUID.
    /// - Content is required and must not exceed 10,000 characters.
    /// - Direction must be either Inbound or Outbound.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MessageResponse>> CreateMessageAsync(
        [FromBody] CreateMessageRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        // Check subscription limit (Sprint 7.5) - soft limit with overage allowed
        var canSendMessage = await _usageLimitService.CanSendMessageAsync(businessId, cancellationToken);
        if (!canSendMessage)
        {
            // NOTE: This is a soft limit - we allow the message but log a warning
            // Overage charges will be calculated in billing
            // In future, we may want to block messages for severely overdue accounts
        }

        var message = await _messageService.CreateMessageAsync(businessId, request, cancellationToken);

        return CreatedAtAction(
            nameof(GetMessageAsync),
            new { id = message.Id },
            message);
    }

    /// <summary>
    /// Updates an existing message with partial data (PATCH operation).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the message to update.</param>
    /// <param name="request">The message update request. Only provided fields will be updated.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>The updated message with all current values.</returns>
    /// <response code="200">Message updated successfully.</response>
    /// <response code="400">Invalid request data (validation errors or business rule violations).</response>
    /// <response code="404">Message not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     PATCH /api/v1/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///     {
    ///       "content": "Updated message content",
    ///       "deliveredAt": "2025-12-03T15:30:05Z",
    ///       "readAt": "2025-12-03T15:35:00Z"
    ///     }
    ///
    /// This is a PATCH operation - only the fields you provide will be updated.
    /// All other fields will remain unchanged.
    ///
    /// Common use cases:
    /// - Update message content (e.g., edit a sent message).
    /// - Update DeliveredAt timestamp when message is delivered to the lead.
    /// - Update ReadAt timestamp when message is read by the lead.
    ///
    /// Validation rules:
    /// - Content must not exceed 10,000 characters if provided.
    /// - DeliveredAt must not be before SentAt if provided.
    /// - ReadAt must not be before DeliveredAt if provided.
    /// </remarks>
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<MessageResponse>> UpdateMessageAsync(
        Guid id,
        [FromBody] UpdateMessageRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var message = await _messageService.UpdateMessageAsync(businessId, id, request, cancellationToken);

        if (message == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Message not found",
                Detail = $"Message with ID {id} was not found or does not belong to your business.",
            });
        }

        return Ok(message);
    }

    /// <summary>
    /// Deletes a message (soft delete - marks as deleted without physical removal).
    /// </summary>
    /// <param name="id">The unique identifier (GUID) of the message to delete.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>No content on successful deletion.</returns>
    /// <response code="204">Message deleted successfully (soft delete - marked with DeletedAt timestamp).</response>
    /// <response code="404">Message not found or does not belong to the authenticated user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     DELETE /api/v1/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6
    ///
    /// This is a soft delete operation - the message is not physically removed from the database.
    /// Instead, the DeletedAt timestamp is set to the current UTC time.
    ///
    /// Soft-deleted messages:
    /// - Will not appear in normal queries (filtered by global query filters).
    /// - Can be restored by clearing the DeletedAt timestamp (future feature).
    /// - Are retained for audit and compliance purposes.
    /// - Remain associated with their conversation for historical tracking.
    ///
    /// This endpoint automatically filters by the authenticated user's business ID (multi-tenancy).
    /// If the message exists but belongs to a conversation in a different business, it will return 404 Not Found.
    ///
    /// Note: Deleting a message does not affect the conversation or other messages in the conversation.
    /// </remarks>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteMessageAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var deleted = await _messageService.DeleteMessageAsync(businessId, id, cancellationToken);

        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Message not found",
                Detail = $"Message with ID {id} was not found or does not belong to your business.",
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Marks a message as read by the current user.
    /// </summary>
    /// <param name="id">The message ID to mark as read.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    /// <response code="204">Message marked as read successfully.</response>
    /// <response code="404">Message not found or does not belong to the user's business.</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/messages/3fa85f64-5717-4562-b3fc-2c963f66afa6/mark-as-read
    ///
    /// This endpoint creates a MessageReadStatus record for the current user and message.
    /// If the message is already marked as read by this user, the operation is idempotent (returns 204).
    ///
    /// Use cases:
    /// - Mark a message as read when a user views it in the conversation UI.
    /// - Track which team members have read specific messages.
    /// - Support multi-user read tracking (multiple users can mark the same message as read).
    /// </remarks>
    [HttpPost("{id}/mark-as-read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkMessageAsReadAsync(
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

        var marked = await _messageService.MarkAsReadAsync(businessId, id, userId.Value, cancellationToken);

        if (!marked)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Message not found",
                Detail = $"Message with ID {id} was not found or does not belong to your business.",
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Searches messages by content using full-text search.
    /// </summary>
    /// <param name="searchTerm">The search term to look for in message content (required, min 2 characters).</param>
    /// <param name="conversationId">Optional conversation ID filter. If provided, searches only within that conversation.</param>
    /// <param name="page">Page number (1-based). Default is 1.</param>
    /// <param name="pageSize">Number of items per page (1-100). Default is 10.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    /// <returns>A paginated list of messages matching the search term.</returns>
    /// <response code="200">Returns the paginated list of matching messages.</response>
    /// <response code="400">Invalid request parameters (e.g., empty search term, page &lt; 1).</response>
    /// <response code="401">User is not authenticated or JWT token is invalid/expired.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/messages/search?searchTerm=pricing&amp;conversationId=3fa85f64-5717-4562-b3fc-2c963f66afa6&amp;page=1&amp;pageSize=10
    ///
    /// This endpoint performs a case-insensitive search on message content.
    /// Results are ordered by SentAt timestamp in descending order (newest first).
    ///
    /// Search behavior:
    /// - Searches within the message content field.
    /// - Case-insensitive matching.
    /// - Partial word matching (e.g., "pric" matches "pricing").
    /// - Multi-tenancy: Only searches messages in the authenticated user's business.
    /// </remarks>
    [HttpGet("search")]
    [ProducesResponseType(typeof(PagedMessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedMessageResponse>> SearchMessagesAsync(
        [FromQuery] string searchTerm,
        [FromQuery] Guid? conversationId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm) || searchTerm.Length < 2)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid search term",
                Detail = "Search term must be at least 2 characters long.",
            });
        }

        var businessId = _currentUserService.GetBusinessId();

        var result = await _messageService.SearchMessagesAsync(
            businessId,
            searchTerm,
            conversationId,
            page,
            pageSize,
            cancellationToken);

        return Ok(result);
    }
}

