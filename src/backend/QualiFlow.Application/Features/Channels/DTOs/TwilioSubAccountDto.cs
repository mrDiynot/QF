namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO for Twilio sub-account information.
/// </summary>
public record TwilioSubAccountDto
{
    /// <summary>
    /// Gets or sets the Twilio sub-account SID.
    /// </summary>
    public string AccountSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the friendly name of the sub-account.
    /// </summary>
    public string FriendlyName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the auth token for the sub-account.
    /// </summary>
    public string AuthToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the sub-account status.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets when the sub-account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
