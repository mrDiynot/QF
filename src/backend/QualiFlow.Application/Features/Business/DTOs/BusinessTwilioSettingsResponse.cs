namespace QualiFlow.Application.Features.Business.DTOs;

/// <summary>
/// Response containing the business's Twilio sub-account settings.
/// Each business has EXACTLY ONE Twilio sub-account for billing isolation.
/// </summary>
public class BusinessTwilioSettingsResponse
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether Twilio is configured for this business.
    /// </summary>
    public bool IsConfigured { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether Twilio is in test mode.
    /// In test mode, magic phone numbers are used and no charges are incurred.
    /// </summary>
    public bool IsTestMode { get; set; }

    /// <summary>
    /// Gets or sets the Twilio sub-account SID.
    /// This is the unique identifier for the business's Twilio sub-account.
    /// </summary>
    public string? SubAccountSid { get; set; }

    /// <summary>
    /// Gets or sets the sub-account status (Active, Suspended, Closed).
    /// </summary>
    public string? SubAccountStatus { get; set; }

    /// <summary>
    /// Gets or sets when the sub-account was created.
    /// </summary>
    public DateTime? SubAccountCreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the list of Twilio channels for this business.
    /// </summary>
    public IReadOnlyList<TwilioChannelSummary> Channels { get; set; } = [];

    /// <summary>
    /// Gets or sets an optional message (e.g., instructions when not configured).
    /// </summary>
    public string? Message { get; set; }
}

/// <summary>
/// Summary of a Twilio channel (SMS, Voice, WhatsApp) for the business.
/// </summary>
public class TwilioChannelSummary
{
    /// <summary>
    /// Gets or sets the channel ID.
    /// </summary>
    public Guid ChannelId { get; set; }

    /// <summary>
    /// Gets or sets the channel type (SMS, Voice, WhatsApp).
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the phone number assigned to this channel.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the channel is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the verification status.
    /// </summary>
    public string VerificationStatus { get; set; } = string.Empty;
}

