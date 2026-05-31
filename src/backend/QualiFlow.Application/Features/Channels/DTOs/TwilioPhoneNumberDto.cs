namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// DTO for Twilio phone number information.
/// </summary>
public record TwilioPhoneNumberDto
{
    /// <summary>
    /// Gets or sets the phone number SID.
    /// </summary>
    public string PhoneNumberSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the phone number in E.164 format.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the friendly name.
    /// </summary>
    public string FriendlyName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether voice capability is enabled.
    /// </summary>
    public bool VoiceEnabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether SMS capability is enabled.
    /// </summary>
    public bool SmsEnabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether MMS capability is enabled.
    /// </summary>
    public bool MmsEnabled { get; set; }

    /// <summary>
    /// Gets or sets the monthly rental cost in USD.
    /// </summary>
    public decimal MonthlyCost { get; set; }
}
