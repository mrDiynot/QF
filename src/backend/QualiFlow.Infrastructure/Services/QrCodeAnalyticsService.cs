using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Analytics.DTOs;
using QualiFlow.Application.Features.Analytics.Services;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for QR code analytics operations.
/// </summary>
public class QrCodeAnalyticsService : IQrCodeAnalyticsService
{
    private readonly QualiFlowDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<QrCodeAnalyticsService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="QrCodeAnalyticsService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="currentUserService">Current user service.</param>
    /// <param name="logger">Logger instance.</param>
    public QrCodeAnalyticsService(
        QualiFlowDbContext context,
        ICurrentUserService currentUserService,
        ILogger<QrCodeAnalyticsService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QrCampaignAnalyticsDto>> GetQrCampaignAnalyticsAsync(
        QrCampaignAnalyticsRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var query = _context.QrCampaigns
            .Where(c => c.BusinessId == businessId);

        // Apply filters
        if (request?.CampaignId.HasValue == true)
        {
            query = query.Where(c => c.Id == request.CampaignId.Value);
        }

        var campaigns = await query
            .Include(c => c.Scans)
            .ToListAsync(cancellationToken);

        var results = campaigns.Select(campaign =>
        {
            var scans = campaign.Scans.AsEnumerable();

            // Apply date filters to scans
            if (request?.StartDate.HasValue == true)
            {
                scans = scans.Where(s => s.ScannedAt >= request.StartDate.Value);
            }

            if (request?.EndDate.HasValue == true)
            {
                scans = scans.Where(s => s.ScannedAt <= request.EndDate.Value);
            }

            var scansList = scans.ToList();
            var totalScans = scansList.Count;
            var uniqueScans = scansList.Count(s => s.IsUnique);
            var conversions = scansList.Count(s => s.Converted);
            var conversionRate = totalScans > 0 ? (decimal)conversions / totalScans : 0;

            return new QrCampaignAnalyticsDto
            {
                CampaignId = campaign.Id,
                CampaignName = campaign.Name,
                TotalScans = totalScans,
                UniqueScans = uniqueScans,
                Conversions = conversions,
                ConversionRate = conversionRate,
                Status = campaign.Status.ToString(),
                LastScanAt = scansList.OrderByDescending(s => s.ScannedAt).FirstOrDefault()?.ScannedAt,
                CreatedAt = campaign.CreatedAt
            };
        }).ToList();

        _logger.LogInformation(
            "Retrieved analytics for {Count} QR campaigns for business {BusinessId}",
            results.Count,
            businessId);

        return results;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QrGeographicDistributionDto>> GetQrGeographicDistributionAsync(
        Guid campaignId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var campaign = await _context.QrCampaigns
            .Where(c => c.Id == campaignId && c.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (campaign == null)
        {
            return Array.Empty<QrGeographicDistributionDto>();
        }

        var geoData = await _context.QrScans
            .Where(s => s.CampaignId == campaignId)
            .GroupBy(s => new { s.LocationCountry, s.LocationState, s.LocationCity })
            .Select(g => new QrGeographicDistributionDto
            {
                Country = g.Key.LocationCountry ?? "Unknown",
                State = g.Key.LocationState,
                City = g.Key.LocationCity,
                ScanCount = g.Count(),
                Conversions = g.Count(s => s.Converted),
                ConversionRate = g.Any() ? (decimal)g.Count(s => s.Converted) / g.Count() : 0
            })
            .OrderByDescending(g => g.ScanCount)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Retrieved geographic distribution for campaign {CampaignId}: {Count} locations",
            campaignId,
            geoData.Count);

        return geoData;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QrDeviceAnalyticsDto>> GetQrDeviceAnalyticsAsync(
        Guid campaignId,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var campaign = await _context.QrCampaigns
            .Where(c => c.Id == campaignId && c.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (campaign == null)
        {
            return Array.Empty<QrDeviceAnalyticsDto>();
        }

        var deviceData = await _context.QrScans
            .Where(s => s.CampaignId == campaignId)
            .GroupBy(s => new { s.DeviceType, s.OperatingSystem, s.Browser })
            .Select(g => new QrDeviceAnalyticsDto
            {
                DeviceType = g.Key.DeviceType ?? "Unknown",
                OperatingSystem = g.Key.OperatingSystem,
                Browser = g.Key.Browser,
                ScanCount = g.Count(),
                Conversions = g.Count(s => s.Converted),
                ConversionRate = g.Any() ? (decimal)g.Count(s => s.Converted) / g.Count() : 0
            })
            .OrderByDescending(g => g.ScanCount)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Retrieved device analytics for campaign {CampaignId}: {Count} device types",
            campaignId,
            deviceData.Count);

        return deviceData;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QrScanTimelineDto>> GetQrScanTimelineAsync(
        Guid campaignId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var campaign = await _context.QrCampaigns
            .Where(c => c.Id == campaignId && c.BusinessId == businessId)
            .FirstOrDefaultAsync(cancellationToken);

        if (campaign == null)
        {
            return Array.Empty<QrScanTimelineDto>();
        }

        var timeline = await _context.QrScans
            .Where(s => s.CampaignId == campaignId &&
                       s.ScannedAt >= startDate &&
                       s.ScannedAt <= endDate)
            .GroupBy(s => s.ScannedAt.Date)
            .Select(g => new QrScanTimelineDto
            {
                Date = g.Key,
                Scans = g.Count(),
                UniqueScans = g.Count(s => s.IsUnique),
                Conversions = g.Count(s => s.Converted)
            })
            .OrderBy(t => t.Date)
            .ToListAsync(cancellationToken);

        _logger.LogInformation(
            "Retrieved scan timeline for campaign {CampaignId}: {Count} data points",
            campaignId,
            timeline.Count);

        return timeline;
    }
}
