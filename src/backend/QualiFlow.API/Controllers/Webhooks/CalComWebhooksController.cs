using Asp.Versioning;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.Onboarding.Services;

namespace QualiFlow.API.Controllers.Webhooks;

#pragma warning disable SA1649 // File name should match first type name - helper class in same file

/// <summary>
/// Cached JsonSerializerOptions to avoid creating new instances per request.
/// </summary>
internal static class JsonSerializerOptionsCache
{
    /// <summary>
    /// Gets the case-insensitive JSON serializer options.
    /// </summary>
    public static JsonSerializerOptions CaseInsensitive { get; } = new()
    {
        PropertyNameCaseInsensitive = true
    };
}

/// <summary>
/// Webhook controller for Cal.com booking events.
/// Handles booking completed and cancelled events for onboarding calls.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks/calcom")]
[AllowAnonymous]
[ApiExplorerSettings(IgnoreApi = true)]
public partial class CalComWebhooksController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CalComWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CalComWebhooksController"/> class.
    /// </summary>
    public CalComWebhooksController(
        IOnboardingService onboardingService,
        IConfiguration configuration,
        ILogger<CalComWebhooksController> logger)
    {
        _onboardingService = onboardingService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Handles Cal.com webhook events for onboarding calls.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>200 OK to acknowledge receipt.</returns>
    [HttpPost("onboarding")]
    [Consumes("application/json")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> HandleOnboardingWebhook(CancellationToken cancellationToken)
    {
        try
        {
            // Read the raw body
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync(cancellationToken);

            // Verify webhook signature if configured
            var webhookSecret = _configuration["CalCom:WebhookSecret"];
            if (!string.IsNullOrEmpty(webhookSecret)
                && !webhookSecret.StartsWith("PLACEHOLDER", StringComparison.OrdinalIgnoreCase))
            {
                var signature = Request.Headers["X-Cal-Signature-256"].ToString();
                if (!VerifySignature(body, signature, webhookSecret))
                {
                    LogInvalidSignature();
                    return BadRequest(new { error = "Invalid signature" });
                }
            }

            // Parse the webhook payload
            var payload = JsonSerializer.Deserialize<CalComWebhookPayload>(body, JsonSerializerOptionsCache.CaseInsensitive);

            if (payload == null)
            {
                LogInvalidPayload();
                return BadRequest(new { error = "Invalid payload" });
            }

            LogWebhookReceived(payload.TriggerEvent, payload.Payload?.Uid ?? "unknown");

            // Process based on event type
            var result = payload.TriggerEvent switch
            {
                "BOOKING_COMPLETED" or "BOOKING_ENDED" => await HandleBookingCompletedAsync(payload, cancellationToken),
                "BOOKING_CANCELLED" => await HandleBookingCancelledAsync(payload, cancellationToken),
                _ => true // Ignore other events
            };

            return Ok(new { success = result });
        }
        catch (Exception ex)
        {
            LogWebhookError(ex);
            return Ok(new { success = false, error = "Processing error" });
        }
    }

    private async Task<bool> HandleBookingCompletedAsync(CalComWebhookPayload payload, CancellationToken cancellationToken)
    {
        var bookingUid = payload.Payload?.Uid;
        if (string.IsNullOrEmpty(bookingUid))
        {
            LogMissingBookingUid();
            return false;
        }

        return await _onboardingService.MarkOnboardingCallCompletedAsync(bookingUid, cancellationToken);
    }

    private async Task<bool> HandleBookingCancelledAsync(CalComWebhookPayload payload, CancellationToken cancellationToken)
    {
        var bookingUid = payload.Payload?.Uid;
        if (string.IsNullOrEmpty(bookingUid))
        {
            LogMissingBookingUid();
            return false;
        }

        return await _onboardingService.MarkOnboardingCallCancelledByWebhookAsync(bookingUid, cancellationToken);
    }

    private static bool VerifySignature(string payload, string signature, string secret)
    {
        if (string.IsNullOrEmpty(signature))
        {
            return false;
        }

        using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
        var expectedSignature = Convert.ToHexString(hash).ToLowerInvariant();

        return string.Equals(signature, expectedSignature, StringComparison.OrdinalIgnoreCase);
    }

    [LoggerMessage(EventId = 8001, Level = LogLevel.Information, Message = "Cal.com webhook received: Event={Event}, BookingUid={BookingUid}")]
    private partial void LogWebhookReceived(string @event, string bookingUid);

    [LoggerMessage(EventId = 8002, Level = LogLevel.Warning, Message = "Cal.com webhook received with invalid signature")]
    private partial void LogInvalidSignature();

    [LoggerMessage(EventId = 8003, Level = LogLevel.Warning, Message = "Cal.com webhook received with invalid payload")]
    private partial void LogInvalidPayload();

    [LoggerMessage(EventId = 8004, Level = LogLevel.Warning, Message = "Cal.com webhook received without booking UID")]
    private partial void LogMissingBookingUid();

    [LoggerMessage(EventId = 8005, Level = LogLevel.Error, Message = "Error processing Cal.com webhook")]
    private partial void LogWebhookError(Exception ex);
}

/// <summary>
/// Cal.com webhook payload structure.
/// </summary>
public class CalComWebhookPayload
{
    /// <summary>Gets or sets the trigger event type.</summary>
    public string TriggerEvent { get; set; } = string.Empty;

    /// <summary>Gets or sets the booking payload.</summary>
    public CalComBookingPayload? Payload { get; set; }
}

/// <summary>
/// Cal.com booking payload structure.
/// </summary>
public class CalComBookingPayload
{
    /// <summary>Gets or sets the booking UID.</summary>
    public string? Uid { get; set; }

    /// <summary>Gets or sets the booking title.</summary>
    public string? Title { get; set; }

    /// <summary>Gets or sets the start time.</summary>
    public DateTime? StartTime { get; set; }

    /// <summary>Gets or sets the end time.</summary>
    public DateTime? EndTime { get; set; }
}

#pragma warning restore SA1649
