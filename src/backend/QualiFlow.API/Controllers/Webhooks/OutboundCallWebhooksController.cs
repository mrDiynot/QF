// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.OutboundCalls.Services;

namespace QualiFlow.API.Controllers.Webhooks;

/// <summary>
/// Webhook controller for outbound call status callbacks from Twilio.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks/twilio")]
[AllowAnonymous]
[ApiExplorerSettings(IgnoreApi = true)]
public class OutboundCallWebhooksController : ControllerBase
{
    private readonly IOutboundCallService _callService;
    private readonly ILogger<OutboundCallWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="OutboundCallWebhooksController"/> class.
    /// </summary>
    public OutboundCallWebhooksController(
        IOutboundCallService callService,
        ILogger<OutboundCallWebhooksController> logger)
    {
        _callService = callService;
        _logger = logger;
    }

    /// <summary>
    /// Handles outbound call status callbacks from Twilio.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>TwiML response.</returns>
    [HttpPost("outbound-status")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleOutboundStatusCallback(
        CancellationToken cancellationToken)
    {
        var form = await Request.ReadFormAsync(cancellationToken);

        var callSid = form["CallSid"].ToString();
        var status = form["CallStatus"].ToString();
        var durationStr = form["CallDuration"].ToString();
        var answeredBy = form["AnsweredBy"].ToString();

        _logger.LogInformation(
            "Received outbound call status callback: CallSid={CallSid}, Status={Status}",
            callSid,
            status);

        if (string.IsNullOrEmpty(callSid) || string.IsNullOrEmpty(status))
        {
            return BadRequest("Missing required parameters");
        }

        int? duration = null;
        if (int.TryParse(durationStr, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsedDuration))
        {
            duration = parsedDuration;
        }

        await _callService.ProcessCallStatusCallbackAsync(
            callSid,
            status,
            duration,
            answeredBy,
            cancellationToken);

        return Ok();
    }

    /// <summary>
    /// Handles outbound call recording callbacks from Twilio.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>OK response.</returns>
    [HttpPost("outbound-recording")]
    [Consumes("application/x-www-form-urlencoded")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleOutboundRecordingCallback(
        CancellationToken cancellationToken)
    {
        var form = await Request.ReadFormAsync(cancellationToken);

        var callSid = form["CallSid"].ToString();
        var recordingUrl = form["RecordingUrl"].ToString();
        var durationStr = form["RecordingDuration"].ToString();

        _logger.LogInformation(
            "Received outbound recording callback: CallSid={CallSid}, RecordingUrl={RecordingUrl}",
            callSid,
            recordingUrl);

        if (string.IsNullOrEmpty(callSid) || string.IsNullOrEmpty(recordingUrl))
        {
            return BadRequest("Missing required parameters");
        }

        var duration = 0;
        if (int.TryParse(durationStr, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var parsedDuration))
        {
            duration = parsedDuration;
        }

        await _callService.ProcessRecordingCallbackAsync(
            callSid,
            recordingUrl,
            duration,
            cancellationToken);

        return Ok();
    }

    /// <summary>
    /// Returns TwiML script for outbound calls.
    /// </summary>
    /// <param name="callId">The outbound call ID.</param>
    /// <param name="cancellationToken">Async cancellation token.</param>
    /// <returns>TwiML XML response.</returns>
    [HttpPost("/api/v{version:apiVersion}/outbound-calls/{callId:guid}/twiml")]
    [Produces("application/xml")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [System.Diagnostics.CodeAnalysis.SuppressMessage(
        "Performance",
        "CA1822:Mark members as static",
        Justification = "Controller action method signature required for ASP.NET Core routing")]
#pragma warning disable CS1998 // Async method lacks 'await' - will be implemented later
#pragma warning disable IDE0060 // Remove unused parameter - will be used when TwiML generation is implemented
    public async Task<IActionResult> GetTwiml(
        Guid callId,
        CancellationToken cancellationToken)
#pragma warning restore IDE0060
#pragma warning restore CS1998
    {
        // TwiML generation from call script will be implemented in future sprint
        // For now, return a simple voice response
        var twiml = """
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice">Hello, this is a call from Qualiflow. Please hold while we connect you.</Say>
                <Pause length="1"/>
                <Say voice="alice">Thank you for your time. Goodbye.</Say>
            </Response>
            """;

        return Content(twiml, "application/xml");
    }
}

