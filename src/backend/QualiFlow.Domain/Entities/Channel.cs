using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a communication channel configured for a business.
/// </summary>
public class Channel : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID that owns this channel.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the channel type (SMS, Voice, WhatsApp, Instagram, Facebook, ChatWidget).
    /// </summary>
    public ChannelType Type { get; set; }

    /// <summary>
    /// Gets or sets the channel display name.
    /// Example: "Main SMS Line", "Customer Support WhatsApp".
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this channel is currently active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the channel configuration as JSON.
    /// Contains channel-specific settings like phone numbers, API keys, webhook URLs, etc.
    /// </summary>
    public string Configuration { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the external provider account ID.
    /// Example: Twilio Account SID, Meta App ID.
    /// </summary>
    public string? ExternalAccountId { get; set; }

    /// <summary>
    /// Gets or sets the external resource ID.
    /// Example: Meta Page ID, Instagram Business Account ID.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the external provider credentials (encrypted).
    /// Example: Auth Token, Access Token.
    /// </summary>
    public string? EncryptedCredentials { get; set; }

    /// <summary>
    /// Gets or sets the credentials (unencrypted, for development).
    /// In production, use EncryptedCredentials instead.
    /// </summary>
    public string? Credentials { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// Example: Token expiration, page name, etc.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the phone number for SMS/Voice/WhatsApp channels.
    /// Example: +12025551234.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL for incoming messages.
    /// Stored as string for database compatibility.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? WebhookUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the date when the channel was last verified/tested.
    /// </summary>
    public DateTime? LastVerifiedAt { get; set; }

    /// <summary>
    /// Gets or sets the verification status.
    /// </summary>
    public string VerificationStatus { get; set; } = "Pending";

    /// <summary>
    /// Gets or sets when the access token expires.
    /// Used for Meta (Facebook/Instagram) channels to track token expiration.
    /// Long-lived tokens expire after 60 days.
    /// </summary>
    public DateTime? TokenExpiresAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business that owns this channel.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the conversations associated with this channel.
    /// </summary>
    public ICollection<Conversation> Conversations { get; } = [];
}
