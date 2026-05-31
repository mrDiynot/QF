namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// Request DTO for configuring CRM settings (Step 4 of onboarding).
/// </summary>
public record ConfigureCrmRequest
{
    /// <summary>
    /// Gets the selected CRM provider.
    /// </summary>
    public required string CrmProvider { get; init; }
}
