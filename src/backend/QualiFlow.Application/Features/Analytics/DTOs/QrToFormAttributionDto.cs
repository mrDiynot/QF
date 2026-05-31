namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// DTO for QR-to-Form attribution data.
/// </summary>
public record QrToFormAttributionDto
{
    /// <summary>
    /// Gets the QR campaign ID.
    /// </summary>
    public Guid CampaignId { get; init; }

    /// <summary>
    /// Gets the QR campaign name.
    /// </summary>
    public string CampaignName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the form ID.
    /// </summary>
    public Guid FormId { get; init; }

    /// <summary>
    /// Gets the form name.
    /// </summary>
    public string FormName { get; init; } = string.Empty;

    /// <summary>
    /// Gets the number of QR scans.
    /// </summary>
    public int Scans { get; init; }

    /// <summary>
    /// Gets the number of form views from QR scans.
    /// </summary>
    public int FormViews { get; init; }

    /// <summary>
    /// Gets the number of form submissions from QR scans.
    /// </summary>
    public int FormSubmissions { get; init; }

    /// <summary>
    /// Gets the scan-to-view conversion rate (0-1).
    /// </summary>
    public decimal ScanToViewRate { get; init; }

    /// <summary>
    /// Gets the scan-to-submission conversion rate (0-1).
    /// </summary>
    public decimal ScanToSubmissionRate { get; init; }

    /// <summary>
    /// Gets the average time from scan to form submission (in seconds).
    /// </summary>
    public int? AvgTimeToSubmission { get; init; }
}
