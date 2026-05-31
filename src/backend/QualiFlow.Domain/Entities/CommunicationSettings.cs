using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents communication settings for a business (tenant).
/// Stores email, SMS, and voice communication preferences.
/// </summary>
public class CommunicationSettings : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// REQUIRED for multi-tenancy isolation.
    /// </summary>
    public Guid BusinessId { get; set; }

    // ============================================================================
    // Email Settings
    // ============================================================================

    /// <summary>
    /// Gets or sets the sender name for outbound emails.
    /// Example: "QualiFlow Support", "John Doe".
    /// </summary>
    public string? EmailSenderName { get; set; }

    /// <summary>
    /// Gets or sets the reply-to email address.
    /// Example: "support@example.com".
    /// </summary>
    public string? EmailReplyTo { get; set; }

    /// <summary>
    /// Gets or sets the email signature (HTML or plain text).
    /// </summary>
    public string? EmailSignature { get; set; }

    // ============================================================================
    // SMS Settings
    // ============================================================================

    /// <summary>
    /// Gets or sets the default sender phone number for SMS.
    /// Example: "+12025551234".
    /// </summary>
    public string? SmsDefaultSender { get; set; }

    /// <summary>
    /// Gets or sets the opt-out message for SMS.
    /// Example: "Reply STOP to unsubscribe".
    /// </summary>
    public string? SmsOptOutMessage { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether SMS auto-reply is enabled.
    /// </summary>
    public bool SmsEnableAutoReply { get; set; } = true;

    // ============================================================================
    // Voice Settings
    // ============================================================================

    /// <summary>
    /// Gets or sets the business hours for voice calls.
    /// Example: "9am-5pm EST", "24/7".
    /// </summary>
    public string? VoiceBusinessHours { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether voicemail is enabled.
    /// </summary>
    public bool VoiceVoicemailEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets the call forwarding number (can be non-Twilio number).
    /// Example: "+15551234567".
    /// </summary>
    public string? VoiceCallForwardingNumber { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the navigation property to the Business entity.
    /// </summary>
    public Business Business { get; set; } = null!;
}

