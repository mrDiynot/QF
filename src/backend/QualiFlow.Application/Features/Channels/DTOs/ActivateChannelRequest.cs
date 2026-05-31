using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Request DTO for activating a channel from onboarding preferences.
/// </summary>
public record ActivateChannelRequest
{
    /// <summary>
    /// Gets the channel type to activate.
    /// Valid values: "sms", "phone", "email", "web_chat", "web_forms", "social".
    /// </summary>
    [Required]
    public required string ChannelType { get; init; }

    /// <summary>
    /// Gets the display name for the channel (optional, will use default if not provided).
    /// </summary>
    public string? DisplayName { get; init; }

    /// <summary>
    /// Gets the phone number option for SMS/Voice channels.
    /// Options: "existing", "new".
    /// </summary>
    public string? PhoneNumberOption { get; init; }

    /// <summary>
    /// Gets the existing phone number if PhoneNumberOption is "existing".
    /// </summary>
    public string? ExistingPhoneNumber { get; init; }
}

