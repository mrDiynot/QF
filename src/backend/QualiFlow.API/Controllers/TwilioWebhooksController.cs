using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QualiFlow.API.Filters;
using QualiFlow.Application.Features.InboundMessages.DTOs;
using QualiFlow.Application.Features.InboundMessages.Services;
using QualiFlow.Application.Features.VoiceAgents.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for handling Twilio webhook callbacks.
/// These endpoints are called by Twilio when inbound messages/calls are received.
/// All endpoints are anonymous as they are called by Twilio's servers.
/// The ValidateTwilioRequest filter ensures requests are signed by Twilio.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks/twilio")]
[AllowAnonymous]
[ValidateTwilioRequest]
public partial class TwilioWebhooksController : ControllerBase
{
    private const string EmptyTwiml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>";

    private readonly IInboundMessageService _inboundMessageService;
    private readonly ITwilioVoiceService _twilioVoiceService;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<TwilioWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TwilioWebhooksController"/> class.
    /// </summary>
    /// <param name="inboundMessageService">The inbound message service.</param>
    /// <param name="twilioVoiceService">The Twilio voice service for AI calls.</param>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger instance.</param>
    public TwilioWebhooksController(
        IInboundMessageService inboundMessageService,
        ITwilioVoiceService twilioVoiceService,
        QualiFlowDbContext context,
        ILogger<TwilioWebhooksController> logger)
    {
        _inboundMessageService = inboundMessageService;
        _twilioVoiceService = twilioVoiceService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Handles inbound SMS messages from Twilio.
    /// </summary>
    /// <remarks>
    /// This endpoint is called by Twilio when an SMS is received on a provisioned number.
    /// The response is TwiML (Twilio Markup Language) in XML format.
    /// </remarks>
    /// <returns>TwiML response.</returns>
    [HttpPost("sms")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleInboundSms(
        [FromForm] TwilioSmsWebhookRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received inbound SMS from {From} to {To}, MessageSid: {MessageSid}",
            request.From, request.To, request.MessageSid);

        var payload = MapToPayload(request);
        var result = await _inboundMessageService.ProcessInboundSmsAsync(payload, cancellationToken);

        return Content(result.TwimlResponse ?? EmptyTwiml, "application/xml");
    }

    /// <summary>
    /// Handles inbound voice calls from Twilio.
    /// </summary>
    /// <remarks>
    /// This endpoint is called by Twilio when a voice call is received.
    /// Returns TwiML to record the call and provide instructions.
    /// </remarks>
    /// <returns>TwiML response with recording instructions.</returns>
    [HttpPost("voice")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleInboundVoice(
        [FromForm] TwilioVoiceWebhookRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received inbound voice call from {From} to {To}, CallSid: {CallSid}",
            request.From, request.To, request.CallSid);

        var payload = MapToPayload(request);
        var result = await _inboundMessageService.ProcessInboundVoiceAsync(payload, cancellationToken);

        return Content(result.TwimlResponse ?? EmptyTwiml, "application/xml");
    }

    /// <summary>
    /// Handles voice recording completion callbacks from Twilio.
    /// </summary>
    /// <remarks>
    /// This endpoint is called by Twilio when a voice recording is complete.
    /// Triggers transcription via OpenAI Whisper.
    /// </remarks>
    /// <returns>Empty TwiML response.</returns>
    [HttpPost("voice/recording")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleVoiceRecording(
        [FromForm] TwilioRecordingRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received voice recording for CallSid: {CallSid}, RecordingSid: {RecordingSid}",
            request.CallSid, request.RecordingSid);

        var payload = MapToPayload(request);
        await _inboundMessageService.ProcessVoiceRecordingAsync(payload, cancellationToken);

        return Content(EmptyTwiml, "application/xml");
    }

    /// <summary>
    /// Handles inbound WhatsApp messages from Twilio.
    /// </summary>
    /// <remarks>
    /// This endpoint is called by Twilio when a WhatsApp message is received.
    /// WhatsApp numbers are prefixed with "whatsapp:" in the From/To fields.
    /// </remarks>
    /// <returns>TwiML response.</returns>
    [HttpPost("whatsapp")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleInboundWhatsApp(
        [FromForm] TwilioWhatsAppWebhookRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Received inbound WhatsApp from {From} to {To}, MessageSid: {MessageSid}",
            request.From, request.To, request.MessageSid);

        var payload = MapToPayload(request);
        var result = await _inboundMessageService.ProcessInboundWhatsAppAsync(payload, cancellationToken);

        return Content(result.TwimlResponse ?? EmptyTwiml, "application/xml");
    }

    /// <summary>
    /// Handles SMS delivery status callbacks from Twilio (Sprint 2.3).
    /// </summary>
    /// <remarks>
    /// Twilio calls this endpoint when SMS delivery status changes:
    /// queued → sending → sent → delivered (or failed/undelivered).
    /// Updates the message delivery status in the database.
    /// </remarks>
    /// <param name="request">The status callback request from Twilio.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>200 OK to acknowledge receipt.</returns>
    [HttpPost("sms/status")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleSmsStatus(
        [FromForm] TwilioStatusCallbackRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation(
                "SMS status update: MessageSid={MessageSid}, Status={MessageStatus}",
                request.MessageSid,
                request.MessageStatus);

            // Find message by Twilio SID
            var message = await _context.Messages
                .FirstOrDefaultAsync(
                    m => m.ExternalMessageId == request.MessageSid,
                    cancellationToken);

            if (message == null)
            {
                _logger.LogWarning(
                    "Message not found for Twilio SID {MessageSid}",
                    request.MessageSid);
                return Ok(); // Return 200 to avoid Twilio retries
            }

            // Map Twilio status to our DeliveryStatus enum
            var previousStatus = message.DeliveryStatus;
            message.DeliveryStatus = MapTwilioStatus(request.MessageStatus);

            // Update failure reason if message failed
            if (message.DeliveryStatus == DeliveryStatus.Failed ||
                message.DeliveryStatus == DeliveryStatus.FailedPermanently)
            {
                message.FailureReason = !string.IsNullOrEmpty(request.ErrorMessage)
                    ? request.ErrorMessage
                    : request.ErrorCode;
            }

            // Update DeliveredAt timestamp
            if (message.DeliveryStatus == DeliveryStatus.Delivered && !message.DeliveredAt.HasValue)
            {
                message.DeliveredAt = DateTime.UtcNow;
            }

            message.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Updated message {MessageId} status from {PreviousStatus} to {NewStatus}",
                message.Id,
                previousStatus,
                message.DeliveryStatus);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error processing SMS status callback for MessageSid {MessageSid}",
                request.MessageSid);
            return Ok(); // Return 200 to avoid Twilio retries on our errors
        }
    }

    /// <summary>
    /// Maps Twilio message status to our DeliveryStatus enum.
    /// </summary>
    private static DeliveryStatus MapTwilioStatus(string? twilioStatus)
    {
        return twilioStatus?.ToLowerInvariant() switch
        {
            "queued" => DeliveryStatus.Queued,
            "sending" => DeliveryStatus.Sending,
            "sent" => DeliveryStatus.Sent,
            "delivered" => DeliveryStatus.Delivered,
            "failed" => DeliveryStatus.Failed,
            "undelivered" => DeliveryStatus.FailedPermanently,
            _ => DeliveryStatus.Pending
        };
    }

    private static TwilioSmsWebhookPayload MapToPayload(TwilioSmsWebhookRequest request) => new()
    {
        MessageSid = request.MessageSid,
        AccountSid = request.AccountSid,
        From = request.From,
        To = request.To,
        Body = request.Body,
        NumMedia = request.NumMedia,
        MediaUrls = ExtractMediaUrls(request),
        FromCity = request.FromCity,
        FromState = request.FromState,
        FromCountry = request.FromCountry,
    };

    private static TwilioVoiceWebhookPayload MapToPayload(TwilioVoiceWebhookRequest request) => new()
    {
        CallSid = request.CallSid,
        AccountSid = request.AccountSid,
        From = request.From,
        To = request.To,
        CallStatus = request.CallStatus,
        Direction = request.Direction,
        CallerCity = request.CallerCity,
        CallerState = request.CallerState,
        CallerCountry = request.CallerCountry,
    };

    private static TwilioRecordingPayload MapToPayload(TwilioRecordingRequest request) => new()
    {
        RecordingSid = request.RecordingSid,
        CallSid = request.CallSid,
        AccountSid = request.AccountSid,
        RecordingUrl = request.RecordingUrl,
        RecordingDuration = request.RecordingDuration,
        RecordingStatus = request.RecordingStatus,
    };

    private static TwilioWhatsAppWebhookPayload MapToPayload(TwilioWhatsAppWebhookRequest request) => new()
    {
        MessageSid = request.MessageSid,
        AccountSid = request.AccountSid,
        From = request.From,
        To = request.To,
        Body = request.Body,
        NumMedia = request.NumMedia,
        MediaUrls = ExtractMediaUrls(request),
        ProfileName = request.ProfileName,
    };

    private static List<string> ExtractMediaUrls(TwilioSmsWebhookRequest request)
    {
        // Twilio sends media URLs as MediaUrl0, MediaUrl1, etc.
        // These would need to be extracted from the form data
        // For now, return empty list - will be enhanced later
        _ = request.NumMedia; // Acknowledge parameter usage
        return [];
    }

    private static List<string> ExtractMediaUrls(TwilioWhatsAppWebhookRequest request)
    {
        // Similar to SMS media extraction
        _ = request.NumMedia; // Acknowledge parameter usage
        return [];
    }
}

/// <summary>
/// Request model for Twilio SMS webhook (form-urlencoded).
/// </summary>
public record TwilioSmsWebhookRequest
{
    public string MessageSid { get; init; } = string.Empty;
    public string AccountSid { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public int NumMedia { get; init; }
    public string? FromCity { get; init; }
    public string? FromState { get; init; }
    public string? FromCountry { get; init; }
}

/// <summary>
/// Request model for Twilio Voice webhook (form-urlencoded).
/// </summary>
public record TwilioVoiceWebhookRequest
{
    public string CallSid { get; init; } = string.Empty;
    public string AccountSid { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string CallStatus { get; init; } = string.Empty;
    public string Direction { get; init; } = string.Empty;
    public string? CallerCity { get; init; }
    public string? CallerState { get; init; }
    public string? CallerCountry { get; init; }
}

/// <summary>
/// Request model for Twilio Recording callback (form-urlencoded).
/// </summary>
public record TwilioRecordingRequest
{
    public string RecordingSid { get; init; } = string.Empty;
    public string CallSid { get; init; } = string.Empty;
    public string AccountSid { get; init; } = string.Empty;

#pragma warning disable CA1056 // URI-like properties should not be strings - Twilio sends as string
    public string RecordingUrl { get; init; } = string.Empty;
#pragma warning restore CA1056

    public int RecordingDuration { get; init; }
    public string RecordingStatus { get; init; } = string.Empty;
}

/// <summary>
/// Request model for Twilio WhatsApp webhook (form-urlencoded).
/// </summary>
public record TwilioWhatsAppWebhookRequest
{
    public string MessageSid { get; init; } = string.Empty;
    public string AccountSid { get; init; } = string.Empty;
    public string From { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public int NumMedia { get; init; }
    public string? ProfileName { get; init; }
}

/// <summary>
/// Request model for Twilio status callback (form-urlencoded).
/// </summary>
public record TwilioStatusCallbackRequest
{
    public string MessageSid { get; init; } = string.Empty;
    public string MessageStatus { get; init; } = string.Empty;
    public string? ErrorCode { get; init; }
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Partial class extension for voice connection endpoints.
/// </summary>
public partial class TwilioWebhooksController
{
    /// <summary>
    /// Handles voice connection - generates TwiML to connect call to AI agent via Media Streams.
    /// </summary>
    /// <param name="agentId">The voice agent ID.</param>
    /// <param name="request">The voice webhook request.</param>
    /// <returns>TwiML response with Media Stream connection.</returns>
    [HttpPost("voice/connect")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    public IActionResult HandleVoiceConnect(
        [FromQuery] Guid agentId,
        [FromForm] TwilioVoiceWebhookRequest request)
    {
        _logger.LogInformation(
            "Voice connection request for agent {AgentId}, CallSid: {CallSid}",
            agentId, request.CallSid);

        var twiml = _twilioVoiceService.GenerateMediaStreamTwiml(agentId, request.CallSid);

        return Content(twiml, "application/xml");
    }

    /// <summary>
    /// Handles voice call status updates from Twilio.
    /// </summary>
    /// <param name="request">The voice status request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>OK response.</returns>
    [HttpPost("voice/status")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleVoiceStatus(
        [FromForm] TwilioVoiceStatusRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Voice status update: CallSid={CallSid}, Status={CallStatus}",
            request.CallSid, request.CallStatus);

        // Find and update call record
        var call = await _context.Set<QualiFlow.Domain.Entities.VoiceCall>()
            .FirstOrDefaultAsync(c => c.ExternalCallSid == request.CallSid, cancellationToken);

        if (call != null)
        {
            call.Status = request.CallStatus.ToLowerInvariant();
            if (request.CallStatus is "completed" or "failed" or "busy" or "no-answer")
            {
                call.EndedAt = DateTime.UtcNow;
                call.DurationSeconds = request.CallDuration;
            }

            await _context.SaveChangesAsync(cancellationToken);
        }

        return Ok();
    }
}

/// <summary>
/// Request model for Twilio voice status callback.
/// </summary>
public record TwilioVoiceStatusRequest
{
    public string CallSid { get; init; } = string.Empty;
    public string CallStatus { get; init; } = string.Empty;
    public int CallDuration { get; init; }
    public string? From { get; init; }
    public string? To { get; init; }
}

