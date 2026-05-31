using QualiFlow.Application.Features.Analytics.DTOs;

namespace QualiFlow.Application.Features.Analytics.Services;

/// <summary>
/// Service interface for QR code analytics operations.
/// </summary>
public interface IQrCodeAnalyticsService
{
    /// <summary>
    /// Gets analytics for all QR campaigns for the current business.
    /// </summary>
    /// <param name="request">Optional filters for campaign analytics.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of campaign analytics.</returns>
    Task<IReadOnlyList<QrCampaignAnalyticsDto>> GetQrCampaignAnalyticsAsync(
        QrCampaignAnalyticsRequest? request = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets geographic distribution of QR scans for a specific campaign.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of geographic distribution data.</returns>
    Task<IReadOnlyList<QrGeographicDistributionDto>> GetQrGeographicDistributionAsync(
        Guid campaignId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets device and browser analytics for QR scans.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of device analytics data.</returns>
    Task<IReadOnlyList<QrDeviceAnalyticsDto>> GetQrDeviceAnalyticsAsync(
        Guid campaignId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets timeline data for QR scans.
    /// </summary>
    /// <param name="campaignId">Campaign identifier.</param>
    /// <param name="startDate">Start date for timeline.</param>
    /// <param name="endDate">End date for timeline.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of timeline data points.</returns>
    Task<IReadOnlyList<QrScanTimelineDto>> GetQrScanTimelineAsync(
        Guid campaignId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
}
