namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO for available Twilio phone number.
/// </summary>
public record TwilioAvailableNumberDto
{
    /// <summary>
    /// Gets or sets the phone number in E.164 format.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the friendly name.
    /// </summary>
    public string FriendlyName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the locality (city).
    /// </summary>
    public string? Locality { get; set; }

    /// <summary>
    /// Gets or sets the region (state/province).
    /// </summary>
    public string? Region { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether voice capability is available.
    /// </summary>
    public bool VoiceEnabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether SMS capability is available.
    /// </summary>
    public bool SmsEnabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether MMS capability is available.
    /// </summary>
    public bool MmsEnabled { get; set; }
}
