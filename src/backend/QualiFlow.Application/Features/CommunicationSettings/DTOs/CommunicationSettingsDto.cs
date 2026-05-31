namespace QualiFlow.Application.Features.CommunicationSettings.DTOs;

/// <summary>
/// Response DTO for communication settings.
/// </summary>
public class CommunicationSettingsDto
{
    /// <summary>
    /// Gets or sets the email settings.
    /// </summary>
    public EmailSettingsDto? Email { get; set; }

    /// <summary>
    /// Gets or sets the SMS settings.
    /// </summary>
    public SmsSettingsDto? Sms { get; set; }

    /// <summary>
    /// Gets or sets the voice settings.
    /// </summary>
    public VoiceSettingsDto? Voice { get; set; }

    /// <summary>
    /// Gets or sets the last update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// Email settings DTO.
/// </summary>
public class EmailSettingsDto
{
    /// <summary>
    /// Gets or sets the sender name.
    /// </summary>
    public string SenderName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the reply-to email address.
    /// </summary>
    public string ReplyToEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the email signature.
    /// </summary>
    public string Signature { get; set; } = string.Empty;
}

/// <summary>
/// SMS settings DTO.
/// </summary>
public class SmsSettingsDto
{
    /// <summary>
    /// Gets or sets the default sender phone number.
    /// </summary>
    public string DefaultSender { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the opt-out message.
    /// </summary>
    public string OptOutMessage { get; set; } = "Reply STOP to unsubscribe";

    /// <summary>
    /// Gets or sets a value indicating whether auto-reply is enabled.
    /// </summary>
    public bool EnableAutoReply { get; set; } = true;
}

/// <summary>
/// Voice settings DTO.
/// </summary>
public class VoiceSettingsDto
{
    /// <summary>
    /// Gets or sets the business hours.
    /// </summary>
    public string BusinessHours { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether voicemail is enabled.
    /// </summary>
    public bool VoicemailEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets the call forwarding number.
    /// </summary>
    public string? CallForwardingNumber { get; set; }
}

