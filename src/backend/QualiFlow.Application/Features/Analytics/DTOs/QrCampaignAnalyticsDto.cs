namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// DTO for QR campaign analytics summary.
/// </summary>
public record QrCampaignAnalyticsDto
{
    /// <summary>
    /// Gets the campaign ID.
    /// </summary>
    public Guid CampaignId { get; init; }

    /// <summary>
    /// Gets the campaign name.
    /// </summary>
    public string CampaignName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the total number of scans.
    /// </summary>
    public int TotalScans { get; init; }

    /// <summary>
    /// Gets the number of unique scans.
    /// </summary>
    public int UniqueScans { get; init; }

    /// <summary>
    /// Gets the number of conversions.
    /// </summary>
    public int Conversions { get; init; }

    /// <summary>
    /// Gets the conversion rate (0-1).
    /// </summary>
    public decimal ConversionRate { get; init; }

    /// <summary>
    /// Gets the campaign status.
    /// </summary>
    public string Status { get; init; } = string.Empty;

    /// <summary>
    /// Gets the last scan timestamp.
    /// </summary>
    public DateTime? LastScanAt { get; init; }

    /// <summary>
    /// Gets when the campaign was created.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// DTO for QR scan geographic distribution.
/// </summary>
public record QrGeographicDistributionDto
{
    /// <summary>
    /// Gets the country code.
    /// </summary>
    public string Country { get; init; } = string.Empty;

    /// <summary>
    /// Gets the state/province.
    /// </summary>
    public string? State { get; init; }

    /// <summary>
    /// Gets the city.
    /// </summary>
    public string? City { get; init; }

    /// <summary>
    /// Gets the number of scans from this location.
    /// </summary>
    public int ScanCount { get; init; }

    /// <summary>
    /// Gets the number of conversions from this location.
    /// </summary>
    public int Conversions { get; init; }

    /// <summary>
    /// Gets the conversion rate for this location (0-1).
    /// </summary>
    public decimal ConversionRate { get; init; }
}

/// <summary>
/// DTO for QR scan device/browser analytics.
/// </summary>
public record QrDeviceAnalyticsDto
{
    /// <summary>
    /// Gets the device type (Mobile, Tablet, Desktop).
    /// </summary>
    public string DeviceType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the operating system.
    /// </summary>
    public string? OperatingSystem { get; init; }

    /// <summary>
    /// Gets the browser name.
    /// </summary>
    public string? Browser { get; init; }

    /// <summary>
    /// Gets the number of scans from this device/browser combination.
    /// </summary>
    public int ScanCount { get; init; }

    /// <summary>
    /// Gets the number of conversions from this device/browser.
    /// </summary>
    public int Conversions { get; init; }

    /// <summary>
    /// Gets the conversion rate (0-1).
    /// </summary>
    public decimal ConversionRate { get; init; }
}

/// <summary>
/// DTO for QR scan timeline data point.
/// </summary>
public record QrScanTimelineDto
{
    /// <summary>
    /// Gets the date.
    /// </summary>
    public DateTime Date { get; init; }

    /// <summary>
    /// Gets the number of scans on this date.
    /// </summary>
    public int Scans { get; init; }

    /// <summary>
    /// Gets the number of unique scans on this date.
    /// </summary>
    public int UniqueScans { get; init; }

    /// <summary>
    /// Gets the number of conversions on this date.
    /// </summary>
    public int Conversions { get; init; }
}

/// <summary>
/// Request DTO for QR campaign analytics filters.
/// </summary>
public record QrCampaignAnalyticsRequest
{
    /// <summary>
    /// Gets the optional campaign ID filter.
    /// </summary>
    public Guid? CampaignId { get; init; }

    /// <summary>
    /// Gets the start date for the date range filter.
    /// </summary>
    public DateTime? StartDate { get; init; }

    /// <summary>
    /// Gets the end date for the date range filter.
    /// </summary>
    public DateTime? EndDate { get; init; }
}
