using System.Diagnostics.CodeAnalysis;

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a CRM provider connection for a business.
/// Stores OAuth credentials and sync configuration.
/// </summary>
[SuppressMessage("Naming", "S101:Types should be named in PascalCase", Justification = "CRM is a well-known acronym")]
public class CRMProvider : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the CRM provider type.
    /// </summary>
    public CRMProviderType ProviderType { get; set; } = CRMProviderType.QualiFlow;

    /// <summary>
    /// Gets or sets a value indicating whether this CRM provider is active.
    /// Only one CRM provider can be active per business.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the sync strategy.
    /// </summary>
    public CRMSyncStrategy SyncStrategy { get; set; } = CRMSyncStrategy.RealTime;

    /// <summary>
    /// Gets or sets the OAuth access token (encrypted).
    /// Null for built-in QualiFlow CRM.
    /// </summary>
    public string? AccessToken { get; set; }

    /// <summary>
    /// Gets or sets the OAuth refresh token (encrypted).
    /// Null for built-in QualiFlow CRM.
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the access token expiration date.
    /// </summary>
    public DateTime? TokenExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the external CRM account ID.
    /// For HubSpot: Portal ID.
    /// For Salesforce: Organization ID.
    /// </summary>
    public string? ExternalAccountId { get; set; }

    /// <summary>
    /// Gets or sets the external CRM account URL.
    /// For HubSpot: https://app.hubspot.com/contacts/{portalId}.
    /// For Salesforce: https://{instance}.salesforce.com.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI properties should not be strings", Justification = "URL is stored as string for flexibility with different CRM providers")]
    public string? ExternalAccountUrl { get; set; }

    /// <summary>
    /// Gets or sets the last successful sync timestamp.
    /// </summary>
    public DateTime? LastSyncAt { get; set; }

    /// <summary>
    /// Gets or sets the last sync error message.
    /// </summary>
    public string? LastSyncError { get; set; }

    /// <summary>
    /// Gets or sets the sync configuration JSON.
    /// Stores provider-specific settings (field mappings, filters, etc.).
    /// </summary>
    public string ConfigurationJson { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the navigation property to the Business entity.
    /// </summary>
    public Business Business { get; set; } = null!;
}

