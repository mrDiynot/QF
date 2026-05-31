using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for handling Stripe webhook events.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/stripe-webhooks")]
[AllowAnonymous]
[Produces("application/json")]
public class StripeWebhooksController : ControllerBase
{
    private readonly IStripeService _stripeService;
    private readonly ILogger<StripeWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="StripeWebhooksController"/> class.
    /// </summary>
    /// <param name="stripeService">The Stripe service.</param>
    /// <param name="logger">The logger.</param>
    public StripeWebhooksController(
        IStripeService stripeService,
        ILogger<StripeWebhooksController> logger)
    {
        _stripeService = stripeService;
        _logger = logger;
    }

    /// <summary>
    /// Handles Stripe webhook events.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A 200 OK response if the webhook was processed successfully.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        try
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(cancellationToken);
            var signature = Request.Headers["Stripe-Signature"].ToString();

            if (string.IsNullOrEmpty(signature))
            {
                _logger.LogWarning("Stripe webhook received without signature");
                return BadRequest(new { message = "Missing Stripe signature" });
            }

            await _stripeService.HandleWebhookAsync(json, signature, cancellationToken);

            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            return BadRequest(new { message = "Webhook processing failed", error = ex.Message });
        }
    }
}

