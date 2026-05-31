using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a business proposal sent to a lead or contact.
/// </summary>
public class Proposal : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (multi-tenancy).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the associated lead ID.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the proposal title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the client name.
    /// </summary>
    public string ClientName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the client email.
    /// </summary>
    public string? ClientEmail { get; set; }

    /// <summary>
    /// Gets or sets the client company.
    /// </summary>
    public string? ClientCompany { get; set; }

    /// <summary>
    /// Gets or sets the proposal status.
    /// </summary>
    public string Status { get; set; } = "draft";

    /// <summary>
    /// Gets or sets the proposal amount.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the currency code.
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Gets or sets the proposal content as JSON.
    /// </summary>
    public string Content { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the proposal template ID used.
    /// </summary>
    public string? TemplateId { get; set; }

    /// <summary>
    /// Gets or sets the valid until date.
    /// </summary>
    public DateTime? ValidUntil { get; set; }

    /// <summary>
    /// Gets or sets when the proposal was sent.
    /// </summary>
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// Gets or sets when the proposal was first viewed.
    /// </summary>
    public DateTime? ViewedAt { get; set; }

    /// <summary>
    /// Gets or sets the total view count.
    /// </summary>
    public int ViewCount { get; set; }

    /// <summary>
    /// Gets or sets when the proposal was accepted.
    /// </summary>
    public DateTime? AcceptedAt { get; set; }

    /// <summary>
    /// Gets or sets when the proposal was declined.
    /// </summary>
    public DateTime? DeclinedAt { get; set; }

    /// <summary>
    /// Gets or sets the decline reason.
    /// </summary>
    public string? DeclineReason { get; set; }

    /// <summary>
    /// Gets or sets the signature data (base64).
    /// </summary>
    public string? SignatureData { get; set; }

    /// <summary>
    /// Gets or sets the signer name.
    /// </summary>
    public string? SignerName { get; set; }

    /// <summary>
    /// Gets or sets the signer IP address.
    /// </summary>
    public string? SignerIpAddress { get; set; }

    /// <summary>
    /// Gets or sets internal notes.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the unique access token for public viewing.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the navigation property for the business.
    /// </summary>
    public virtual Business? Business { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the lead.
    /// </summary>
    public virtual Lead? Lead { get; set; }
}
