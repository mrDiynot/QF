#pragma warning disable SA1649 // File name should match first type name

using Asp.Versioning;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Features.InboundMessages.DTOs;
using QualiFlow.Application.Features.InboundMessages.Services;
using QualiFlow.Application.Features.Webhooks.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Cached JsonSerializerOptions for Meta webhook deserialization.
/// </summary>
internal static class MetaJsonSerializerOptions
{
    /// <summary>
    /// Gets the case-insensitive JSON serializer options.
    /// </summary>
    public static JsonSerializerOptions CaseInsensitive { get; } = new()
    {
        PropertyNameCaseInsensitive = true,
    };
}

/// <summary>
/// Webhook controller for Meta (Instagram/Facebook) inbound messages.
/// These endpoints are called by Meta's webhook system when messages are received.
/// </summary>
/// <remarks>
/// Meta webhook flow:
/// 1. Meta sends a GET request for webhook verification (hub.challenge).
/// 2. Meta sends POST requests with message events.
/// 3. We verify the X-Hub-Signature-256 header for security.
/// 4. We process the message and return 200 OK quickly.
/// 5. AI qualification is processed asynchronously via Hangfire.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/webhooks/meta")]
[AllowAnonymous]
[ApiExplorerSettings(GroupName = "v1")]
public partial class MetaWebhooksController : ControllerBase
{
    private readonly string _verifyToken;
    private readonly string? _appSecret;
    private readonly IInboundMessageService _inboundMessageService;
    private readonly IWebhookFailureService? _webhookFailureService;
    private readonly ILogger<MetaWebhooksController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaWebhooksController"/> class.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    /// <param name="inboundMessageService">The inbound message service.</param>
    /// <param name="webhookFailureService">The webhook failure service (optional).</param>
    /// <param name="logger">The logger.</param>
    public MetaWebhooksController(
        IConfiguration configuration,
        IInboundMessageService inboundMessageService,
        ILogger<MetaWebhooksController> logger,
        IWebhookFailureService? webhookFailureService = null)
    {
        _verifyToken = configuration["Meta:VerifyToken"]
            ?? throw new InvalidOperationException("Meta:VerifyToken configuration is required");
        _appSecret = configuration["Meta:AppSecret"];
        _inboundMessageService = inboundMessageService;
        _webhookFailureService = webhookFailureService;
        _logger = logger;
    }

    /// <summary>
    /// Webhook verification endpoint for Meta.
    /// Meta calls this with hub.mode, hub.verify_token, and hub.challenge.
    /// </summary>
    /// <param name="mode">The hub mode (should be "subscribe").</param>
    /// <param name="verifyToken">The verification token.</param>
    /// <param name="challenge">The challenge string to return.</param>
    /// <returns>The challenge string if verification succeeds.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult VerifyWebhook(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        LogWebhookVerification(_logger, mode, verifyToken);

        if (string.Equals(mode, "subscribe", StringComparison.Ordinal) &&
            string.Equals(verifyToken, _verifyToken, StringComparison.Ordinal))
        {
            LogWebhookVerificationSuccess(_logger);
            return Ok(challenge);
        }

        LogWebhookVerificationFailed(_logger, mode, verifyToken);
        return Forbid();
    }

    /// <summary>
    /// Receives inbound messages from Meta (Instagram and Facebook Messenger).
    /// Verifies the X-Hub-Signature-256 header for security.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>200 OK to acknowledge receipt.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ReceiveWebhook(CancellationToken cancellationToken)
    {
        // Read raw body for signature verification
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true);
        var body = await reader.ReadToEndAsync(cancellationToken);
        Request.Body.Position = 0;

        // Verify signature if app secret is configured
        if (!string.IsNullOrEmpty(_appSecret))
        {
            var signature = Request.Headers["X-Hub-Signature-256"].ToString();
            if (!VerifySignature(body, signature, _appSecret))
            {
                LogInvalidSignature(_logger, signature);
                return Unauthorized(new { error = "Invalid signature" });
            }
        }

        // Parse the payload
        var payload = JsonSerializer.Deserialize<MetaWebhookPayload>(body, MetaJsonSerializerOptions.CaseInsensitive);
        if (payload == null)
        {
            LogInvalidPayload(_logger);
            return BadRequest(new { error = "Invalid payload" });
        }

        LogWebhookReceived(_logger, payload.ObjectType, payload.Entry.Count);

        foreach (var entry in payload.Entry)
        {
            try
            {
                await ProcessEntryAsync(entry, cancellationToken);
            }
            catch (Exception ex)
            {
                LogProcessingError(_logger, ex, entry.Id);

                // Record failure for retry if service is available
                if (_webhookFailureService != null)
                {
                    await _webhookFailureService.RecordFailureAsync(
                        "meta",
                        body,
                        ex,
                        new Dictionary<string, object> { ["entryId"] = entry.Id },
                        cancellationToken);
                }
            }
        }

        // Always return 200 OK quickly to acknowledge receipt
        return Ok("EVENT_RECEIVED");
    }

    /// <summary>
    /// Verifies the X-Hub-Signature-256 header using HMAC-SHA256.
    /// </summary>
    private static bool VerifySignature(string payload, string? signatureHeader, string appSecret)
    {
        if (string.IsNullOrEmpty(signatureHeader))
        {
            return false;
        }

        // Meta sends signature as "sha256=<hex_signature>"
        if (!signatureHeader.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var providedSignature = signatureHeader["sha256=".Length..];
        var keyBytes = Encoding.UTF8.GetBytes(appSecret);
        var payloadBytes = Encoding.UTF8.GetBytes(payload);
        var hash = HMACSHA256.HashData(keyBytes, payloadBytes);
        var expectedSignature = Convert.ToHexString(hash);

        // Use constant-time comparison to prevent timing attacks
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expectedSignature),
            Encoding.UTF8.GetBytes(providedSignature.ToUpperInvariant()));
    }

    private async Task ProcessEntryAsync(
        MetaWebhookEntry entry,
        CancellationToken cancellationToken)
    {
        // Handle Facebook Messenger messages
        if (entry.Messaging != null)
        {
            foreach (var messaging in entry.Messaging)
            {
                if (messaging.Message != null)
                {
                    await _inboundMessageService.ProcessInboundFacebookAsync(
                        entry.Id,
                        messaging.Sender.Id,
                        messaging.Message.Mid,
                        messaging.Message.Text,
                        messaging.Timestamp,
                        cancellationToken);
                }
            }
        }

        // Handle Instagram messages (via changes)
        if (entry.Changes != null)
        {
            foreach (var change in entry.Changes)
            {
                if (string.Equals(change.Field, "messages", StringComparison.Ordinal) &&
                    change.Value != null)
                {
                    await _inboundMessageService.ProcessInboundInstagramAsync(
                        entry.Id,
                        change.Value.From ?? string.Empty,
                        Guid.NewGuid().ToString(), // Instagram doesn't always provide message ID
                        change.Value.Message,
                        entry.Time,
                        cancellationToken);
                }
            }
        }
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Meta webhook verification: mode={Mode}, token={Token}")]
    private static partial void LogWebhookVerification(ILogger logger, string? mode, string? token);

    [LoggerMessage(Level = LogLevel.Information, Message = "Meta webhook verification successful")]
    private static partial void LogWebhookVerificationSuccess(ILogger logger);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Meta webhook verification failed: mode={Mode}, token={Token}")]
    private static partial void LogWebhookVerificationFailed(ILogger logger, string? mode, string? token);

    [LoggerMessage(Level = LogLevel.Information, Message = "Meta webhook received: object={ObjectType}, entries={EntryCount}")]
    private static partial void LogWebhookReceived(ILogger logger, string objectType, int entryCount);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Meta webhook invalid signature: {Signature}")]
    private static partial void LogInvalidSignature(ILogger logger, string? signature);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Meta webhook invalid payload")]
    private static partial void LogInvalidPayload(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "Meta webhook processing error for entry {EntryId}")]
    private static partial void LogProcessingError(ILogger logger, Exception ex, string entryId);
}

