using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Request to send an SMS or WhatsApp message via Twilio.
/// </summary>
public record TwilioSendSmsRequest
{
    /// <summary>
    /// Gets the phone number to send to (E.164 format).
    /// </summary>
    public required string ToPhoneNumber { get; init; }

    /// <summary>
    /// Gets the phone number to send from (E.164 format).
    /// </summary>
    public required string FromPhoneNumber { get; init; }

    /// <summary>
    /// Gets the message body.
    /// </summary>
    public required string Body { get; init; }

    /// <summary>
    /// Gets the Twilio sub-account SID (optional).
    /// </summary>
    public string? SubAccountSid { get; init; }

    /// <summary>
    /// Gets the status callback URL (optional).
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API uses string URLs")]
    public string? StatusCallbackUrl { get; init; }

    /// <summary>
    /// Gets the media URLs for MMS (optional).
    /// </summary>
    public IReadOnlyList<string>? MediaUrls { get; init; }
}

/// <summary>
/// Result of sending an SMS or WhatsApp message.
/// </summary>
public record TwilioSmsResultDto
{
    /// <summary>
    /// Gets the Twilio Message SID.
    /// </summary>
    public required string MessageSid { get; init; }

    /// <summary>
    /// Gets the message status.
    /// </summary>
    public required string Status { get; init; }

    /// <summary>
    /// Gets the phone number the message was sent to.
    /// </summary>
    public required string ToPhoneNumber { get; init; }

    /// <summary>
    /// Gets the phone number the message was sent from.
    /// </summary>
    public required string FromPhoneNumber { get; init; }

    /// <summary>
    /// Gets the message body.
    /// </summary>
    public required string Body { get; init; }

    /// <summary>
    /// Gets the number of segments in the message.
    /// </summary>
    public int? NumSegments { get; init; }

    /// <summary>
    /// Gets the estimated price of the message.
    /// </summary>
    public decimal? Price { get; init; }

    /// <summary>
    /// Gets the price unit (e.g., "USD").
    /// </summary>
    public string? PriceUnit { get; init; }

    /// <summary>
    /// Gets the timestamp when the message was sent.
    /// </summary>
    public DateTime SentAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Gets a value indicating whether the send was successful.
    /// </summary>
    public bool Success { get; init; } = true;

    /// <summary>
    /// Gets the error message if the send failed.
    /// </summary>
    public string? ErrorMessage { get; init; }
}
