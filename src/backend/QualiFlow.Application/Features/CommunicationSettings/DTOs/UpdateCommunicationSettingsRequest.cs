namespace QualiFlow.Application.Features.CommunicationSettings.DTOs;

/// <summary>
/// Request DTO for updating communication settings.
/// All fields are optional - only provided fields will be updated.
/// </summary>
public class UpdateCommunicationSettingsRequest
{
    /// <summary>
    /// Gets or sets the email settings to update.
    /// </summary>
    public EmailSettingsDto? Email { get; set; }

    /// <summary>
    /// Gets or sets the SMS settings to update.
    /// </summary>
    public SmsSettingsDto? Sms { get; set; }

    /// <summary>
    /// Gets or sets the voice settings to update.
    /// </summary>
    public VoiceSettingsDto? Voice { get; set; }
}

