using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for CRM OAuth callback.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public class CRMOAuthCallbackResponse
{
    /// <summary>
    /// Gets or sets a value indicating whether the OAuth flow succeeded.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the CRM provider ID.
    /// </summary>
    public Guid CRMProviderId { get; set; }

    /// <summary>
    /// Gets or sets the CRM provider type (HubSpot, Salesforce, etc.).
    /// </summary>
    public string ProviderType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the external account ID from the CRM system.
    /// </summary>
    public string? ExternalAccountId { get; set; }

    /// <summary>
    /// Gets or sets the external account URL (e.g., HubSpot portal URL).
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI properties should not be strings", Justification = "URL is stored as string for flexibility")]
    public string? ExternalAccountUrl { get; set; }

    /// <summary>
    /// Gets or sets the error message if OAuth failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the return URL to redirect to after OAuth completion.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI properties should not be strings", Justification = "Return URL is stored as string for flexibility and may be relative path")]
    public string? ReturnUrl { get; set; }
}

