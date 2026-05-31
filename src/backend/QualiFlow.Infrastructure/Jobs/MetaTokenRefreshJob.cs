#pragma warning disable SA1203 // Constant fields should appear before non-constant fields

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to refresh Meta (Facebook/Instagram) access tokens before they expire.
/// Long-lived tokens expire after 60 days, so we refresh them when they have less than 7 days remaining.
/// </summary>
public partial class MetaTokenRefreshJob
{
    /// <summary>
    /// Number of days before expiry to trigger a refresh.
    /// </summary>
    private const int RefreshThresholdDays = 7;

    /// <summary>
    /// Number of days before expiry to send a warning alert.
    /// </summary>
    private const int WarningThresholdDays = 14;

    /// <summary>
    /// Number of days before expiry to send a critical alert.
    /// </summary>
    private const int CriticalThresholdDays = 3;

    private readonly QualiFlowDbContext _context;
    private readonly IMetaOAuthService _oAuthService;
    private readonly ILogger<MetaTokenRefreshJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaTokenRefreshJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="oAuthService">The Meta OAuth service for token refresh.</param>
    /// <param name="logger">The logger.</param>
    public MetaTokenRefreshJob(
        QualiFlowDbContext context,
        IMetaOAuthService oAuthService,
        ILogger<MetaTokenRefreshJob> logger)
    {
        _context = context;
        _oAuthService = oAuthService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the token refresh job.
    /// Finds all Meta channels with tokens expiring soon and refreshes them.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        LogJobStarted(_logger);

        var refreshThreshold = DateTime.UtcNow.AddDays(RefreshThresholdDays);

        // Find all Meta channels (Instagram/Facebook) with tokens expiring soon
        // Include Business to skip channels for deleted businesses
        var channelsToRefresh = await _context.Channels
            .Include(c => c.Business)
            .Where(c => (c.Type == ChannelType.Instagram || c.Type == ChannelType.Facebook) &&
                       c.IsActive &&
                       c.DeletedAt == null &&
                       c.TokenExpiresAt.HasValue &&
                       c.TokenExpiresAt.Value <= refreshThreshold)
            .ToListAsync();

        LogChannelsFound(_logger, channelsToRefresh.Count);

        if (channelsToRefresh.Count == 0)
        {
            return;
        }

        var successCount = 0;
        var failureCount = 0;

        foreach (var channel in channelsToRefresh)
        {
            // Skip channels for businesses that no longer exist (orphaned data)
            if (channel.Business == null || channel.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping token refresh for channel {ChannelId} - business {BusinessId} not found or deleted",
                    channel.Id,
                    channel.BusinessId);
                failureCount++;
                continue;
            }

            try
            {
                // Get the current access token
                var currentToken = channel.Credentials ?? channel.EncryptedCredentials;
                if (string.IsNullOrEmpty(currentToken))
                {
                    LogNoToken(_logger, channel.Id);
                    failureCount++;
                    continue;
                }

                // Refresh the token
                var result = await _oAuthService.RefreshLongLivedTokenAsync(currentToken);

                if (result.Success && !string.IsNullOrEmpty(result.AccessToken))
                {
                    // Update the channel with the new token
                    channel.Credentials = result.AccessToken;
                    channel.TokenExpiresAt = result.ExpiresAt;
                    channel.LastVerifiedAt = DateTime.UtcNow;
                    channel.VerificationStatus = "Verified";

                    LogTokenRefreshed(_logger, channel.Id, result.ExpiresAt);
                    successCount++;
                }
                else
                {
                    LogRefreshFailed(_logger, channel.Id, result.ErrorMessage ?? "Unknown error");
                    channel.VerificationStatus = "TokenExpired";
                    failureCount++;
                }
            }
            catch (Exception ex)
            {
                LogRefreshException(_logger, channel.Id, ex);
                channel.VerificationStatus = "TokenExpired";
                failureCount++;
            }
        }

        await _context.SaveChangesAsync();

        LogJobCompleted(_logger, successCount, failureCount);
    }

    /// <summary>
    /// Checks for tokens that are about to expire and logs warnings/alerts.
    /// This can be used by monitoring systems to trigger notifications.
    /// </summary>
    /// <returns>Token expiry status summary.</returns>
    public async Task<TokenExpiryStatus> CheckTokenExpiryStatusAsync()
    {
        var now = DateTime.UtcNow;
        var warningThreshold = now.AddDays(WarningThresholdDays);
        var criticalThreshold = now.AddDays(CriticalThresholdDays);

        var metaChannels = await _context.Channels
            .Where(c => (c.Type == ChannelType.Instagram || c.Type == ChannelType.Facebook) &&
                       c.IsActive &&
                       c.DeletedAt == null &&
                       c.TokenExpiresAt.HasValue)
            .Select(c => new { c.Id, c.BusinessId, c.Name, c.Type, c.TokenExpiresAt })
            .ToListAsync();

        var status = new TokenExpiryStatus();

        foreach (var channel in metaChannels)
        {
            if (!channel.TokenExpiresAt.HasValue)
            {
                continue;
            }

            var expiresAt = channel.TokenExpiresAt.Value;
            var daysUntilExpiry = (expiresAt - now).TotalDays;

            if (expiresAt <= now)
            {
                // Already expired
                status.ExpiredCount++;
                LogTokenExpired(_logger, channel.Id, channel.Name, channel.Type.ToString());
            }
            else if (expiresAt <= criticalThreshold)
            {
                // Critical - less than 3 days
                status.CriticalCount++;
                LogTokenCritical(_logger, channel.Id, channel.Name, (int)daysUntilExpiry);
            }
            else if (expiresAt <= warningThreshold)
            {
                // Warning - less than 14 days
                status.WarningCount++;
                LogTokenWarning(_logger, channel.Id, channel.Name, (int)daysUntilExpiry);
            }
            else
            {
                status.HealthyCount++;
            }
        }

        status.TotalChannels = metaChannels.Count;
        LogTokenStatusCheck(_logger, status.HealthyCount, status.WarningCount, status.CriticalCount, status.ExpiredCount);

        return status;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting Meta token refresh job")]
    private static partial void LogJobStarted(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Found {Count} Meta channels with tokens expiring soon")]
    private static partial void LogChannelsFound(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Channel {ChannelId} has no access token to refresh")]
    private static partial void LogNoToken(ILogger logger, Guid channelId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Refreshed token for channel {ChannelId}, new expiry: {ExpiresAt}")]
    private static partial void LogTokenRefreshed(ILogger logger, Guid channelId, DateTime? expiresAt);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Failed to refresh token for channel {ChannelId}: {Error}")]
    private static partial void LogRefreshFailed(ILogger logger, Guid channelId, string error);

    [LoggerMessage(Level = LogLevel.Error, Message = "Exception refreshing token for channel {ChannelId}")]
    private static partial void LogRefreshException(ILogger logger, Guid channelId, Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Meta token refresh job completed. Success: {SuccessCount}, Failed: {FailureCount}")]
    private static partial void LogJobCompleted(ILogger logger, int successCount, int failureCount);

    [LoggerMessage(Level = LogLevel.Error, Message = "ALERT: Token EXPIRED for channel {ChannelId} ({ChannelName}) - Type: {ChannelType}")]
    private static partial void LogTokenExpired(ILogger logger, Guid channelId, string channelName, string channelType);

    [LoggerMessage(Level = LogLevel.Error, Message = "CRITICAL: Token expiring in {DaysRemaining} days for channel {ChannelId} ({ChannelName})")]
    private static partial void LogTokenCritical(ILogger logger, Guid channelId, string channelName, int daysRemaining);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Token expiring in {DaysRemaining} days for channel {ChannelId} ({ChannelName})")]
    private static partial void LogTokenWarning(ILogger logger, Guid channelId, string channelName, int daysRemaining);

    [LoggerMessage(Level = LogLevel.Information, Message = "Token status check: Healthy={Healthy}, Warning={Warning}, Critical={Critical}, Expired={Expired}")]
    private static partial void LogTokenStatusCheck(ILogger logger, int healthy, int warning, int critical, int expired);
}

/// <summary>
/// Summary of token expiry status across all Meta channels.
/// </summary>
public record TokenExpiryStatus
{
    /// <summary>Gets or sets the total number of Meta channels.</summary>
    public int TotalChannels { get; set; }

    /// <summary>Gets or sets the count of channels with healthy tokens (>14 days).</summary>
    public int HealthyCount { get; set; }

    /// <summary>Gets or sets the count of channels with tokens expiring soon (7-14 days).</summary>
    public int WarningCount { get; set; }

    /// <summary>Gets or sets the count of channels with tokens expiring very soon (less than 7 days).</summary>
    public int CriticalCount { get; set; }

    /// <summary>Gets or sets the count of channels with expired tokens.</summary>
    public int ExpiredCount { get; set; }

    /// <summary>Gets a value indicating whether any tokens need attention.</summary>
    public bool NeedsAttention => WarningCount > 0 || CriticalCount > 0 || ExpiredCount > 0;
}

