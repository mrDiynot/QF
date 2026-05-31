namespace QualiFlow.Application.Features.InboundMessages.DTOs;

/// <summary>
/// Represents an inbound SMS webhook payload from Twilio.
/// </summary>
public record TwilioSmsWebhookPayload
{
    /// <summary>
    /// Gets the unique identifier for this message (Twilio MessageSid).
    /// </summary>
    public string MessageSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the Twilio Account SID (or sub-account SID).
    /// </summary>
    public string AccountSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the sender's phone number in E.164 format.
    /// </summary>
    public string From { get; init; } = string.Empty;

    /// <summary>
    /// Gets the receiving phone number in E.164 format.
    /// </summary>
    public string To { get; init; } = string.Empty;

    /// <summary>
    /// Gets the message body/content.
    /// </summary>
    public string Body { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of media attachments.
    /// </summary>
    public int NumMedia { get; init; }

    /// <summary>
    /// Gets the media URLs (if any).
    /// </summary>
    public IReadOnlyList<string> MediaUrls { get; init; } = [];

    /// <summary>
    /// Gets the sender's city (if available from Twilio lookup).
    /// </summary>
    public string? FromCity { get; init; }

    /// <summary>
    /// Gets the sender's state (if available from Twilio lookup).
    /// </summary>
    public string? FromState { get; init; }

    /// <summary>
    /// Gets the sender's country (if available from Twilio lookup).
    /// </summary>
    public string? FromCountry { get; init; }
}

/// <summary>
/// Represents an inbound voice call webhook payload from Twilio.
/// </summary>
public record TwilioVoiceWebhookPayload
{
    /// <summary>
    /// Gets the unique identifier for this call (Twilio CallSid).
    /// </summary>
    public string CallSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the Twilio Account SID (or sub-account SID).
    /// </summary>
    public string AccountSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the caller's phone number in E.164 format.
    /// </summary>
    public string From { get; init; } = string.Empty;

    /// <summary>
    /// Gets the receiving phone number in E.164 format.
    /// </summary>
    public string To { get; init; } = string.Empty;

    /// <summary>
    /// Gets the call status (ringing, in-progress, completed, etc.).
    /// </summary>
    public string CallStatus { get; init; } = string.Empty;

    /// <summary>
    /// Gets the call direction (inbound or outbound-dial).
    /// </summary>
    public string Direction { get; init; } = string.Empty;

    /// <summary>
    /// Gets the caller's city (if available).
    /// </summary>
    public string? CallerCity { get; init; }

    /// <summary>
    /// Gets the caller's state (if available).
    /// </summary>
    public string? CallerState { get; init; }

    /// <summary>
    /// Gets the caller's country (if available).
    /// </summary>
    public string? CallerCountry { get; init; }
}

/// <summary>
/// Represents a voice recording completion webhook payload from Twilio.
/// </summary>
public record TwilioRecordingPayload
{
    /// <summary>
    /// Gets the unique identifier for this recording (Twilio RecordingSid).
    /// </summary>
    public string RecordingSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the associated call SID.
    /// </summary>
    public string CallSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the Twilio Account SID.
    /// </summary>
    public string AccountSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the URI to the recording.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string RecordingUrl { get; init; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets the recording duration in seconds.
    /// </summary>
    public int RecordingDuration { get; init; }

    /// <summary>
    /// Gets the recording status.
    /// </summary>
    public string RecordingStatus { get; init; } = string.Empty;
}

/// <summary>
/// Represents an inbound WhatsApp message webhook payload from Twilio.
/// WhatsApp numbers are prefixed with "whatsapp:" in the From/To fields.
/// </summary>
public record TwilioWhatsAppWebhookPayload
{
    /// <summary>
    /// Gets the unique identifier for this message (Twilio MessageSid).
    /// </summary>
    public string MessageSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the Twilio Account SID.
    /// </summary>
    public string AccountSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the sender's WhatsApp number (format: whatsapp:+1234567890).
    /// </summary>
    public string From { get; init; } = string.Empty;

    /// <summary>
    /// Gets the receiving WhatsApp number (format: whatsapp:+1234567890).
    /// </summary>
    public string To { get; init; } = string.Empty;

    /// <summary>
    /// Gets the message body/content.
    /// </summary>
    public string Body { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of media attachments.
    /// </summary>
    public int NumMedia { get; init; }

    /// <summary>
    /// Gets the media URLs (if any).
    /// </summary>
    public IReadOnlyList<string> MediaUrls { get; init; } = [];

    /// <summary>
    /// Gets the sender's profile name (WhatsApp display name).
    /// </summary>
    public string? ProfileName { get; init; }

    /// <summary>
    /// Extracts the raw phone number from the WhatsApp-prefixed From field.
    /// </summary>
    /// <returns>The phone number without the whatsapp: prefix.</returns>
    public string GetRawFromNumber() => From.Replace("whatsapp:", string.Empty, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Extracts the raw phone number from the WhatsApp-prefixed To field.
    /// </summary>
    /// <returns>The phone number without the whatsapp: prefix.</returns>
    public string GetRawToNumber() => To.Replace("whatsapp:", string.Empty, StringComparison.OrdinalIgnoreCase);
}

