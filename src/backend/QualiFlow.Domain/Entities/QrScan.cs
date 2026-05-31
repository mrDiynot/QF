using System.Net;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a single QR code scan event with tracking data.
/// </summary>
public class QrScan
{
    /// <summary>
    /// Gets or sets the unique identifier for the scan.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the campaign ID this scan belongs to.
    /// </summary>
    public Guid CampaignId { get; set; }

    /// <summary>
    /// Gets or sets when the QR code was scanned.
    /// </summary>
    public DateTime ScannedAt { get; set; }

    /// <summary>
    /// Gets or sets the IP address of the scanner.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the user agent string from the scanner's device.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the device type (Mobile, Tablet, Desktop).
    /// </summary>
    public string? DeviceType { get; set; }

    /// <summary>
    /// Gets or sets the operating system (iOS, Android, Windows, macOS, etc.).
    /// </summary>
    public string? OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the browser name (Safari, Chrome, Firefox, Edge, etc.).
    /// </summary>
    public string? Browser { get; set; }

    /// <summary>
    /// Gets or sets the city where the scan occurred (from IP geolocation).
    /// </summary>
    public string? LocationCity { get; set; }

    /// <summary>
    /// Gets or sets the state/province where the scan occurred.
    /// </summary>
    public string? LocationState { get; set; }

    /// <summary>
    /// Gets or sets the country code (ISO 3166-1 alpha-2) where the scan occurred.
    /// </summary>
    public string? LocationCountry { get; set; }

    /// <summary>
    /// Gets or sets the latitude coordinate.
    /// </summary>
    public decimal? Latitude { get; set; }

    /// <summary>
    /// Gets or sets the longitude coordinate.
    /// </summary>
    public decimal? Longitude { get; set; }

    /// <summary>
    /// Gets or sets the referrer URL (if available).
    /// </summary>
    public string? Referrer { get; set; }

    /// <summary>
    /// Gets or sets UTM source parameter.
    /// </summary>
    public string? UtmSource { get; set; }

    /// <summary>
    /// Gets or sets UTM medium parameter.
    /// </summary>
    public string? UtmMedium { get; set; }

    /// <summary>
    /// Gets or sets UTM campaign parameter.
    /// </summary>
    public string? UtmCampaign { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this scan resulted in a conversion (form submission, purchase, etc.).
    /// </summary>
    public bool Converted { get; set; }

    /// <summary>
    /// Gets or sets when the conversion occurred (if applicable).
    /// </summary>
    public DateTime? ConvertedAt { get; set; }

    /// <summary>
    /// Gets or sets the type of conversion (FormSubmission, Purchase, Signup, etc.).
    /// </summary>
    public string? ConversionType { get; set; }

    /// <summary>
    /// Gets or sets the conversion value (e.g., form submission ID, order ID).
    /// </summary>
    public string? ConversionValue { get; set; }

    /// <summary>
    /// Gets or sets a unique session identifier for tracking user journey.
    /// </summary>
    public string? SessionId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is a unique scan (first time from this device/session).
    /// </summary>
    public bool IsUnique { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the campaign this scan belongs to.
    /// </summary>
    public QrCampaign Campaign { get; set; } = null!;
}
