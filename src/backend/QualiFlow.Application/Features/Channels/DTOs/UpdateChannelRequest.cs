namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Request DTO for updating a channel.
/// </summary>
public record UpdateChannelRequest
{
    /// <summary>
    /// Gets or sets the channel name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the channel is active.
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Gets or sets the phone number for SMS/Voice/WhatsApp channels.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the configuration JSON.
    /// </summary>
    public string? Configuration { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL.
    /// Stored as string for serialization compatibility.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? WebhookUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the encrypted credentials.
    /// </summary>
    public string? EncryptedCredentials { get; set; }
}
