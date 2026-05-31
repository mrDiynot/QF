namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// Request DTO for selecting channels and automations during onboarding (Steps 6-7).
/// </summary>
public record SelectChannelsRequest
{
    /// <summary>
    /// Gets the list of selected channel types (Step 6).
    /// Valid values: "sms", "phone", "email", "web_chat", "web_forms", "social".
    /// </summary>
    public IReadOnlyList<string> SelectedChannels { get; init; } = [];

    /// <summary>
    /// Gets the list of selected automation priorities (Step 7).
    /// Valid values: "lead_qualification", "missed_call", "review_survey", "proposal".
    /// </summary>
    public IReadOnlyList<string> SelectedAutomations { get; init; } = [];
}
