using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a contact in QualiFlow's built-in CRM system.
/// A contact can be a person or business entity (customer, lead, or prospect).
/// </summary>
public class Contact : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    // ============================================================================
    // Basic Information
    // ============================================================================

    /// <summary>
    /// Gets or sets the contact's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the contact's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the contact's email address (unique per business).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the contact's phone number.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Gets or sets the contact's company name.
    /// </summary>
    public string? Company { get; set; }

    /// <summary>
    /// Gets or sets the contact's job title.
    /// </summary>
    public string? JobTitle { get; set; }

    // ============================================================================
    // Status & Classification
    // ============================================================================

    /// <summary>
    /// Gets or sets the contact status.
    /// </summary>
    public ContactStatus Status { get; set; } = ContactStatus.Active;

    /// <summary>
    /// Gets or sets the source of this contact.
    /// </summary>
    public ContactSource Source { get; set; } = ContactSource.Manual;

    /// <summary>
    /// Gets or sets the contact tags as a JSON array.
    /// Example: "[\"VIP\",\"Priority\"]".
    /// </summary>
    public string Tags { get; set; } = "[]";

    // ============================================================================
    // CRM Metadata
    // ============================================================================

    /// <summary>
    /// Gets or sets the date and time when this contact was last contacted (UTC).
    /// </summary>
    public DateTime? LastContactedAt { get; set; }

    /// <summary>
    /// Gets or sets the user ID who owns/manages this contact.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets internal notes about this contact.
    /// </summary>
    public string? Notes { get; set; }

    // ============================================================================
    // Lead Integration
    // ============================================================================

    /// <summary>
    /// Gets or sets the original Lead ID if this contact was converted from a Lead.
    /// </summary>
    public Guid? OriginalLeadId { get; set; }

    // ============================================================================
    // External CRM Integration (for external CRM adapters)
    // ============================================================================

    /// <summary>
    /// Gets or sets the external CRM contact ID (e.g., HubSpot contact ID).
    /// </summary>
    public string? ExternalCRMId { get; set; }

    /// <summary>
    /// Gets or sets the external CRM contact URL.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database for simplicity and compatibility")]
    public string? ExternalCRMUrl { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business this contact belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user assigned to this contact.
    /// </summary>
    public ApplicationUser? AssignedToUser { get; set; }

    /// <summary>
    /// Gets or sets the original lead if this contact was converted.
    /// </summary>
    public Lead? OriginalLead { get; set; }

    /// <summary>
    /// Gets the deals associated with this contact.
    /// </summary>
    public ICollection<Deal> Deals { get; } = new List<Deal>();

    // ============================================================================
    // Computed Properties
    // ============================================================================

    /// <summary>
    /// Gets the contact's full name.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// Gets a value indicating whether this contact was converted from a lead.
    /// </summary>
    public bool IsConvertedFromLead => OriginalLeadId.HasValue;
}
