namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// DTO containing the business's onboarding preferences for display in settings.
/// </summary>
public record OnboardingPreferencesDto
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the selected industry.
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the team size.
    /// </summary>
    public string? TeamSize { get; set; }

    /// <summary>
    /// Gets or sets the selected CRM provider.
    /// </summary>
    public string? CrmProvider { get; set; }

    /// <summary>
    /// Gets or sets the lead type (B2B, B2C, or Both).
    /// </summary>
    public string? LeadType { get; set; }

    /// <summary>
    /// Gets or sets the main business objective.
    /// </summary>
    public string? MainObjective { get; set; }

    /// <summary>
    /// Gets or sets the selected communication channels.
    /// </summary>
    public IReadOnlyList<string> SelectedChannels { get; set; } = [];

    /// <summary>
    /// Gets or sets the selected automation priorities.
    /// </summary>
    public IReadOnlyList<string> SelectedAutomations { get; set; } = [];

    /// <summary>
    /// Gets or sets the phone number setup option.
    /// </summary>
    public string? PhoneNumberOption { get; set; }

    /// <summary>
    /// Gets or sets the existing phone number if applicable.
    /// </summary>
    public string? ExistingPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the AI-assigned phone number if applicable.
    /// </summary>
    public string? AiPhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the call forwarding destination.
    /// </summary>
    public string? CallForwardTo { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether missed-call SMS is enabled.
    /// </summary>
    public bool MissedCallSmsEnabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether outbound AI calling is enabled.
    /// </summary>
    public bool OutboundAiCallingEnabled { get; set; }

    /// <summary>
    /// Gets or sets the AI persona/tone.
    /// </summary>
    public string? AiTone { get; set; }

    /// <summary>
    /// Gets or sets the business hours configuration.
    /// </summary>
    public string? BusinessHours { get; set; }

    /// <summary>
    /// Gets or sets the follow-up preference.
    /// </summary>
    public string? FollowUpPreference { get; set; }

    /// <summary>
    /// Gets or sets the date when onboarding was completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether onboarding is complete.
    /// </summary>
    public bool IsComplete { get; set; }
}
