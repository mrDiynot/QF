using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Request DTO for creating a new channel.
/// </summary>
public record CreateChannelRequest
{
    /// <summary>
    /// Gets or sets the channel type.
    /// </summary>
    public ChannelType Type { get; set; }

    /// <summary>
    /// Gets or sets the channel name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the phone number for SMS/Voice/WhatsApp channels.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the configuration JSON.
    /// </summary>
    public string Configuration { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the external account ID (Twilio SID, Meta App ID).
    /// </summary>
    public string? ExternalAccountId { get; set; }

    /// <summary>
    /// Gets or sets the encrypted credentials.
    /// </summary>
    public string? EncryptedCredentials { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL for incoming messages.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? WebhookUrl { get; set; }
#pragma warning restore CA1056
}
