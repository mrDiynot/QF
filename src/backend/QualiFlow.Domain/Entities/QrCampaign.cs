using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// QR campaign status enumeration.
/// </summary>
public enum QrCampaignStatus
{
    /// <summary>
    /// Campaign is in draft state.
    /// </summary>
    Draft,

    /// <summary>
    /// Campaign is active and tracking scans.
    /// </summary>
    Active,

    /// <summary>
    /// Campaign is paused.
    /// </summary>
    Paused,

    /// <summary>
    /// Campaign has been completed.
    /// </summary>
    Completed,

    /// <summary>
    /// Campaign has been archived.
    /// </summary>
    Archived
}

/// <summary>
/// Represents a QR code campaign for tracking scans and conversions.
/// </summary>
public class QrCampaign
{
    /// <summary>
    /// Gets or sets the unique identifier for the QR campaign.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the business ID that owns this campaign.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the campaign name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the QR code URL (shortened tracking URL).
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "URLs are stored as strings in the database")]
    public string QrCodeUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the destination URL where the QR code redirects.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "URLs are stored as strings in the database")]
    public string? DestinationUrl { get; set; }

    /// <summary>
    /// Gets or sets the linked form ID (optional - if QR code links to a form).
    /// </summary>
    public Guid? LinkedFormId { get; set; }

    /// <summary>
    /// Gets or sets the campaign status.
    /// </summary>
    public QrCampaignStatus Status { get; set; } = QrCampaignStatus.Active;

    /// <summary>
    /// Gets or sets the QR code image data (base64 encoded SVG/PNG).
    /// </summary>
    public string? QrCodeImageData { get; set; }

    /// <summary>
    /// Gets or sets the QR code customization settings (JSON).
    /// </summary>
    public string? CustomizationSettings { get; set; }

    /// <summary>
    /// Gets or sets campaign metadata (tags, notes, etc.) as JSON.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets or sets when the campaign was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the campaign was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the campaign was deleted (soft delete).
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business that owns this campaign.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the linked form (if applicable).
    /// </summary>
    public Form? LinkedForm { get; set; }

    /// <summary>
    /// Gets the collection of scans for this campaign.
    /// </summary>
    public ICollection<QrScan> Scans { get; init; } = new List<QrScan>();
}
