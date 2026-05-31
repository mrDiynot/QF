using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for handling Resend webhook events.
/// This endpoint is called by Resend's webhook system and does not require authentication.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks/resend")]
[AllowAnonymous]
[Produces("application/json")]
public class ResendWebhooksController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<ResendWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ResendWebhooksController"/> class.
    /// </summary>
    /// <param name="emailService">The email service.</param>
    /// <param name="logger">The logger.</param>
    public ResendWebhooksController(
        IEmailService emailService,
        ILogger<ResendWebhooksController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Handles Resend webhook events for email delivery status updates.
    /// </summary>
    /// <param name="webhookEvent">The webhook event data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>OK response.</returns>
    /// <remarks>
    /// Supported events:
    /// - email.sent: Email was accepted by Resend.
    /// - email.delivered: Email was successfully delivered.
    /// - email.opened: Email was opened by recipient.
    /// - email.clicked: Link in email was clicked.
    /// - email.bounced: Email bounced.
    /// - email.failed: Email delivery failed.
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> HandleWebhook(
        [FromBody] ResendWebhookEvent webhookEvent,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received Resend webhook event: {EventType} for email {EmailId}",
            webhookEvent.Type,
            webhookEvent.EmailId);

        try
        {
            await _emailService.ProcessWebhookEventAsync(webhookEvent, cancellationToken);

            _logger.LogInformation(
                "Successfully processed Resend webhook event: {EventType}",
                webhookEvent.Type);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error processing Resend webhook event: {EventType} for email {EmailId}",
                webhookEvent.Type,
                webhookEvent.EmailId);

            return BadRequest(new { error = "Failed to process webhook event" });
        }
    }
}

