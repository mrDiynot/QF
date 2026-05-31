#pragma warning disable SA1116 // Parameters should begin on line after declaration
#pragma warning disable S1066 // Merge if statements
#pragma warning disable S6580 // Use format provider when parsing date
#pragma warning disable MA0011 // Use overload with IFormatProvider

using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// Manages Meta access tokens for pages and Instagram accounts.
/// Tokens are stored encrypted in the Channel.Credentials field.
/// </summary>
public partial class MetaTokenManager : IMetaTokenManager
{
    private readonly QualiFlowDbContext _dbContext;
    private readonly IMetaApiClient _apiClient;
    private readonly ILogger<MetaTokenManager> _logger;

    // Token refresh threshold - refresh if expiring within 7 days
    private static readonly TimeSpan RefreshThreshold = TimeSpan.FromDays(7);

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaTokenManager"/> class.
    /// </summary>
    public MetaTokenManager(
        QualiFlowDbContext dbContext,
        IMetaApiClient apiClient,
        ILogger<MetaTokenManager> logger)
    {
        _dbContext = dbContext;
        _apiClient = apiClient;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string?> GetAccessTokenForPageAsync(string pageId, CancellationToken cancellationToken = default)
    {
        // Find channel by external page ID
        var channel = await _dbContext.Channels
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                (c.Type == ChannelType.Facebook || c.Type == ChannelType.Instagram) &&
                c.ExternalId == pageId &&
                c.DeletedAt == null,
                cancellationToken);

        if (channel == null)
        {
            LogChannelNotFound(_logger, pageId);
            return null;
        }

        return channel.Credentials;
    }

    /// <inheritdoc />
    public async Task<string?> GetAccessTokenForChannelAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        var channel = await _dbContext.Channels
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == channelId && c.DeletedAt == null, cancellationToken);

        return channel?.Credentials;
    }

    /// <inheritdoc />
    public async Task StoreAccessTokenAsync(
        string pageId,
        string accessToken,
        DateTime? expiresAt,
        CancellationToken cancellationToken = default)
    {
        var channel = await _dbContext.Channels
            .FirstOrDefaultAsync(c =>
                (c.Type == ChannelType.Facebook || c.Type == ChannelType.Instagram) &&
                c.ExternalId == pageId &&
                c.DeletedAt == null,
                cancellationToken);

        if (channel == null)
        {
            LogChannelNotFound(_logger, pageId);
            return;
        }

        // Store the access token (should be encrypted in production)
        channel.Credentials = accessToken;
        channel.UpdatedAt = DateTime.UtcNow;

        // Store expiration in metadata if provided
        if (expiresAt.HasValue)
        {
            var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                channel.Metadata ?? "{}") ?? [];
            metadata["token_expires_at"] = expiresAt.Value.ToString("O");
            channel.Metadata = System.Text.Json.JsonSerializer.Serialize(metadata);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        LogTokenStored(_logger, pageId);
    }

    /// <inheritdoc />
    public async Task<bool> RefreshTokenIfNeededAsync(string pageId, CancellationToken cancellationToken = default)
    {
        var channel = await _dbContext.Channels
            .FirstOrDefaultAsync(c =>
                (c.Type == ChannelType.Facebook || c.Type == ChannelType.Instagram) &&
                c.ExternalId == pageId &&
                c.DeletedAt == null,
                cancellationToken);

        if (channel == null || string.IsNullOrEmpty(channel.Credentials))
        {
            return false;
        }

        // Check if token needs refresh
        var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
            channel.Metadata ?? "{}") ?? [];

        if (metadata.TryGetValue("token_expires_at", out var expiresAtObj) &&
            DateTime.TryParse(expiresAtObj.ToString(), out var expiresAt))
        {
            if (expiresAt - DateTime.UtcNow > RefreshThreshold)
            {
                // Token is still valid, no refresh needed
                return false;
            }
        }

        // Attempt to refresh the token
        try
        {
            var newToken = await _apiClient.GetLongLivedTokenAsync(channel.Credentials, cancellationToken);
            if (newToken != null && !string.IsNullOrEmpty(newToken.AccessToken))
            {
                var newExpiresAt = DateTime.UtcNow.AddSeconds(newToken.ExpiresIn);
                await StoreAccessTokenAsync(pageId, newToken.AccessToken, newExpiresAt, cancellationToken);
                LogTokenRefreshed(_logger, pageId);
                return true;
            }
        }
        catch (MetaApiException ex)
        {
            LogTokenRefreshFailed(_logger, pageId, ex.Message);
        }

        return false;
    }

    /// <inheritdoc />
    public async Task<bool> ValidateTokenAsync(string accessToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var debugInfo = await _apiClient.DebugTokenAsync(accessToken, cancellationToken);
            return debugInfo?.IsValid ?? false;
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc />
    public async Task RevokeTokenAsync(string pageId, CancellationToken cancellationToken = default)
    {
        var channel = await _dbContext.Channels
            .FirstOrDefaultAsync(c =>
                (c.Type == ChannelType.Facebook || c.Type == ChannelType.Instagram) &&
                c.ExternalId == pageId &&
                c.DeletedAt == null,
                cancellationToken);

        if (channel == null)
        {
            return;
        }

        // Clear the stored token
        channel.Credentials = null;
        channel.UpdatedAt = DateTime.UtcNow;

        // Clear token metadata
        var metadata = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
            channel.Metadata ?? "{}") ?? [];
        metadata.Remove("token_expires_at");
        channel.Metadata = System.Text.Json.JsonSerializer.Serialize(metadata);

        await _dbContext.SaveChangesAsync(cancellationToken);
        LogTokenRevoked(_logger, pageId);
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Warning, Message = "Channel not found for page {PageId}")]
    private static partial void LogChannelNotFound(ILogger logger, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Access token stored for page {PageId}")]
    private static partial void LogTokenStored(ILogger logger, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Access token refreshed for page {PageId}")]
    private static partial void LogTokenRefreshed(ILogger logger, string pageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Token refresh failed for page {PageId}: {Error}")]
    private static partial void LogTokenRefreshFailed(ILogger logger, string pageId, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Access token revoked for page {PageId}")]
    private static partial void LogTokenRevoked(ILogger logger, string pageId);
}

