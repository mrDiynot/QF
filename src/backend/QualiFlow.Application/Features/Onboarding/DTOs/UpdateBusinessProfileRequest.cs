namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// Request DTO for updating business profile during onboarding (Steps 1-5).
/// Consolidates: Industry, Team Size, CRM, Lead Type, and Objective.
/// </summary>
public record UpdateBusinessProfileRequest
{
    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string BusinessName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the industry (Step 1).
    /// Valid values: "real_estate", "healthcare", "saas", "consulting", "ecommerce", "other".
    /// </summary>
    public string Industry { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the company/team size (Step 2).
    /// Valid values: "just_me", "2-5", "6-20", "21-50", "50+".
    /// </summary>
    public string CompanySize { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timezone.
    /// </summary>
    public string Timezone { get; set; } = "UTC";

    /// <summary>
    /// Gets or sets the website URL.
    /// </summary>
    public string? Website { get; set; }

    /// <summary>
    /// Gets or sets the country.
    /// </summary>
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the selected CRM platform (Step 3).
    /// Valid values: "hubspot", "salesforce", "pipedrive", "zoho", "builtin", "other".
    /// </summary>
    public string? CrmPlatform { get; set; }

    /// <summary>
    /// Gets or sets the lead type (Step 4).
    /// Valid values: "b2b", "b2c", "both".
    /// </summary>
    public string? LeadType { get; set; }

    /// <summary>
    /// Gets or sets the main objective (Step 5).
    /// Valid values: "sales", "automation", "communication", "meetings", "proposals", "organize".
    /// </summary>
    public string? MainObjective { get; set; }
}
