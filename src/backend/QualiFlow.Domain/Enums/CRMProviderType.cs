namespace QualiFlow.Domain.Enums;

/// <summary>
/// Supported CRM provider types.
/// </summary>
public enum CRMProviderType
{
    /// <summary>
    /// QualiFlow built-in CRM (default).
    /// No external dependencies, uses QualiFlow database.
    /// </summary>
    QualiFlow = 0,

    /// <summary>
    /// HubSpot CRM integration via OAuth 2.0.
    /// </summary>
    HubSpot = 1,

    /// <summary>
    /// Salesforce CRM integration via OAuth 2.0.
    /// </summary>
    Salesforce = 2,

    /// <summary>
    /// Pipedrive CRM integration (Phase 2).
    /// </summary>
    Pipedrive = 3,

    /// <summary>
    /// Zoho CRM integration (Phase 2).
    /// </summary>
    Zoho = 4
}

