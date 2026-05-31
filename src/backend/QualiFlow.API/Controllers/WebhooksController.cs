using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Webhooks.DTOs;
using QualiFlow.Application.Features.Webhooks.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for webhook management operations.
/// Provides RESTful endpoints for creating, reading, updating, and deleting webhooks.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All operations are automatically filtered by the current user's business ID.
/// - HMAC-SHA256 signature: All webhook deliveries include X-Webhook-Signature header for verification.
/// - Auto-disable: Webhooks are automatically disabled after 10 consecutive failures.
/// - Retry logic: Failed deliveries are retried with exponential backoff (1min, 5min, 30min, 2hr, 12hr).
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class WebhooksController : ControllerBase
{
    private readonly IWebhookService _webhookService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebhooksController"/> class.
    /// </summary>
    /// <param name="webhookService">The webhook service.</param>
    /// <param name="currentUserService">The current user service.</param>
    public WebhooksController(
        IWebhookService webhookService,
        ICurrentUserService currentUserService)
    {
        _webhookService = webhookService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets all webhooks for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhooks.</returns>
    /// <response code="200">Returns the list of webhooks.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<WebhookResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<WebhookResponse>>> GetWebhooksAsync(
        CancellationToken cancellationToken = default)
    {
        var webhooks = await _webhookService.GetAllAsync(cancellationToken);
        return Ok(webhooks);
    }

    /// <summary>
    /// Gets a webhook by ID.
    /// </summary>
    /// <param name="id">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The webhook if found.</returns>
    /// <response code="200">Returns the webhook.</response>
    /// <response code="404">Webhook not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("{id}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(WebhookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WebhookResponse>> GetWebhookByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookService.GetByIdAsync(id, cancellationToken);
        if (webhook == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Webhook not found",
                Detail = $"Webhook with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(webhook);
    }

    /// <summary>
    /// Creates a new webhook.
    /// </summary>
    /// <param name="request">The webhook creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created webhook.</returns>
    /// <response code="201">Webhook created successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost]
    [ProducesResponseType(typeof(WebhookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WebhookResponse>> CreateWebhookAsync(
        [FromBody] CreateWebhookRequest request,
        CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(
            nameof(GetWebhookByIdAsync),
            new { id = webhook.Id },
            webhook);
    }

    /// <summary>
    /// Updates an existing webhook.
    /// </summary>
    /// <param name="id">The webhook ID.</param>
    /// <param name="request">The webhook update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated webhook.</returns>
    /// <response code="200">Webhook updated successfully.</response>
    /// <response code="404">Webhook not found.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(WebhookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WebhookResponse>> UpdateWebhookAsync(
        Guid id,
        [FromBody] UpdateWebhookRequest request,
        CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookService.UpdateAsync(id, request, cancellationToken);
        if (webhook == null)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Webhook not found",
                Detail = $"Webhook with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(webhook);
    }

    /// <summary>
    /// Deletes a webhook.
    /// </summary>
    /// <param name="id">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <response code="204">Webhook deleted successfully.</response>
    /// <response code="404">Webhook not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteWebhookAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var deleted = await _webhookService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Webhook not found",
                Detail = $"Webhook with ID {id} was not found.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Gets delivery logs for a specific webhook.
    /// </summary>
    /// <param name="id">The webhook ID.</param>
    /// <param name="skip">Number of records to skip for pagination. Default is 0.</param>
    /// <param name="take">Number of records to take for pagination. Default is 50.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhook delivery logs.</returns>
    /// <response code="200">Returns the delivery logs.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("{id}/deliveries")]
    [ProducesResponseType(typeof(IReadOnlyList<WebhookDeliveryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<WebhookDeliveryResponse>>> GetDeliveryLogsAsync(
        Guid id,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 50,
        CancellationToken cancellationToken = default)
    {
        var deliveries = await _webhookService.GetDeliveryLogsAsync(id, skip, take, cancellationToken);
        return Ok(deliveries);
    }

    /// <summary>
    /// Tests a webhook by sending a test payload.
    /// </summary>
    /// <param name="id">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The test delivery result.</returns>
    /// <response code="200">Test delivery completed.</response>
    /// <response code="404">Webhook not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/test")]
    [ProducesResponseType(typeof(WebhookDeliveryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WebhookDeliveryResponse>> TestWebhookAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _webhookService.TestAsync(id, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new ProblemDetails
            {
                Title = "Webhook not found",
                Detail = ex.Message,
                Status = StatusCodes.Status404NotFound,
            });
        }
    }
}

