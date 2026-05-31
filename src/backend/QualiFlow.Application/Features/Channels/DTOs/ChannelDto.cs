using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO for Channel response.
/// </summary>
public record ChannelDto
{
    /// <summary>
    /// Gets or sets the channel ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the channel type.
    /// </summary>
    public ChannelType Type { get; set; }

    /// <summary>
    /// Gets or sets the channel name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether the channel is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the phone number for SMS/Voice/WhatsApp channels.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL.
    /// Stored as string for serialization compatibility.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? WebhookUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the verification status.
    /// </summary>
    public string VerificationStatus { get; set; } = "Pending";

    /// <summary>
    /// Gets or sets when the channel was last verified.
    /// </summary>
    public DateTime? LastVerifiedAt { get; set; }

    /// <summary>
    /// Gets or sets when the channel was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the channel was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the channel configuration as JSON string.
    /// Contains channel-specific settings like phone numbers, API keys, webhook URLs, etc.
    /// </summary>
    public string? Configuration { get; set; }

    /// <summary>
    /// Gets or sets the external resource ID.
    /// Example: Meta Page ID, Instagram Business Account ID.
    /// </summary>
    public string? ExternalId { get; set; }

    /// <summary>
    /// Gets or sets the external provider account ID.
    /// Example: Twilio Account SID, Meta App ID.
    /// </summary>
    public string? ExternalAccountId { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON string.
    /// Example: Token expiration, page name, etc.
    /// </summary>
    public string? Metadata { get; set; }
}
