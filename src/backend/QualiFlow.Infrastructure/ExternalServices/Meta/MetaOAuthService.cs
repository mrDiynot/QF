#pragma warning disable S3260 // Private record classes should be sealed
#pragma warning disable CA1812 // Internal class never instantiated
#pragma warning disable CA1852 // Type can be sealed
#pragma warning disable S3459 // Unassigned auto-property
#pragma warning disable S1144 // Unused private accessor
#pragma warning disable CA1055 // URI-like return types should not be strings
#pragma warning disable SA1116 // Parameters should begin on line after declaration

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QualiFlow.Application.Features.Meta.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// Service for Meta OAuth flow to connect Facebook Pages and Instagram accounts.
/// </summary>
public partial class MetaOAuthService : IMetaOAuthService
{
    private readonly IMetaApiClient _apiClient;
    private readonly QualiFlowDbContext _dbContext;
    private readonly MetaOptions _options;
    private readonly ILogger<MetaOAuthService> _logger;

    // Required permissions for messaging
    private static readonly string[] RequiredScopes =
    [
        "pages_messaging",
        "pages_manage_metadata",
        "pages_read_engagement",
        "instagram_basic",
        "instagram_manage_messages",
    ];

    /// <summary>
    /// Initializes a new instance of the <see cref="MetaOAuthService"/> class.
    /// </summary>
    public MetaOAuthService(
        IMetaApiClient apiClient,
        QualiFlowDbContext dbContext,
        IOptions<MetaOptions> options,
        ILogger<MetaOAuthService> logger)
    {
        _apiClient = apiClient;
        _dbContext = dbContext;
        _options = options.Value;
        _logger = logger;
    }

    /// <inheritdoc />
    public string GetAuthorizationUrl(Guid businessId, string state, string channelType)
    {
        // Validate configuration before generating URL
        if (string.IsNullOrEmpty(_options.OAuthRedirectUri))
        {
            _logger.LogError(
                "Meta OAuth configuration error: OAuthRedirectUri is not configured. " +
                "Please set Meta:OAuthRedirectUri in appsettings.Development.json or via environment variables.");
            throw new InvalidOperationException(
                "Meta OAuth is not configured. Please contact support or configure OAuthRedirectUri.");
        }

        if (string.IsNullOrEmpty(_options.AppId))
        {
            _logger.LogError("Meta OAuth configuration error: AppId is not configured.");
            throw new InvalidOperationException(
                "Meta OAuth is not configured. Please configure AppId.");
        }

        var scopes = string.Join(",", RequiredScopes);
        var encodedState = Uri.EscapeDataString($"{businessId}|{channelType}|{state}");
        var redirectUri = Uri.EscapeDataString(_options.OAuthRedirectUri);

        _logger.LogInformation(
            "Generating Meta OAuth URL for business {BusinessId}, redirect: {RedirectUri}",
            businessId, _options.OAuthRedirectUri);

        return $"https://www.facebook.com/{_options.GraphApiVersion}/dialog/oauth" +
               $"?client_id={_options.AppId}" +
               $"&redirect_uri={redirectUri}" +
               $"&state={encodedState}" +
               $"&scope={scopes}" +
               "&response_type=code";
    }

    /// <inheritdoc />
    public async Task<MetaOAuthCallbackResult> HandleCallbackAsync(
        string code,
        string state,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Parse state
            var stateParts = state.Split('|');
            if (stateParts.Length < 2 || !Guid.TryParse(stateParts[0], out var businessId))
            {
                return MetaOAuthCallbackResult.FailureResult("Invalid state parameter");
            }

            var channelType = stateParts[1];

            // Exchange code for token
            var tokenResponse = await _apiClient.ExchangeCodeForTokenAsync(
                code,
                _options.OAuthRedirectUri,
                cancellationToken);

            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                return MetaOAuthCallbackResult.FailureResult("Failed to exchange code for token");
            }

            // Get long-lived token
            var longLivedToken = await _apiClient.GetLongLivedTokenAsync(
                tokenResponse.AccessToken,
                cancellationToken);

            var accessToken = longLivedToken?.AccessToken ?? tokenResponse.AccessToken;

            // Get user's pages
            var pages = await GetUserPagesAsync(accessToken, cancellationToken);

            LogOAuthSuccess(_logger, businessId, pages.Count);

            // Automatically connect all pages as channels
            foreach (var page in pages)
            {
                try
                {
                    // Connect Facebook page
                    await ConnectPageAsync(
                        businessId,
                        page.Id,
                        page.AccessToken,
                        page.Name,
                        "Facebook",
                        cancellationToken);

                    // Subscribe to webhooks for this page
                    await SubscribeToWebhooksAsync(page.Id, page.AccessToken, cancellationToken);

                    // If page has Instagram, also create Instagram channel
                    if (!string.IsNullOrEmpty(page.InstagramBusinessAccountId))
                    {
                        await ConnectPageAsync(
                            businessId,
                            page.InstagramBusinessAccountId,
                            page.AccessToken,
                            $"{page.Name} (Instagram)",
                            "Instagram",
                            cancellationToken);
                    }
                }
                catch (Exception ex)
                {
                    // Continue with other pages even if one fails
                    _logger.LogWarning(
                        ex,
                        "Failed to connect page {PageId} for business {BusinessId}",
                        page.Id,
                        businessId);
                }
            }

            return MetaOAuthCallbackResult.SuccessResult(accessToken, businessId, channelType, pages);
        }
        catch (MetaApiException ex)
        {
            LogOAuthError(_logger, ex.Message, ex.ErrorCode);
            return MetaOAuthCallbackResult.FailureResult(ex.Message);
        }
        catch (Exception ex)
        {
            LogOAuthException(_logger, ex);
            return MetaOAuthCallbackResult.FailureResult("An unexpected error occurred");
        }
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<MetaPageInfo>> GetUserPagesAsync(
        string userAccessToken,
        CancellationToken cancellationToken = default)
    {
        var response = await _apiClient.GetAsync<PagesResponse>(
            "me/accounts?fields=id,name,access_token,category,instagram_business_account",
            userAccessToken,
            cancellationToken);

        if (response?.Data == null)
        {
            return [];
        }

        return response.Data.Select(p => new MetaPageInfo
        {
            Id = p.Id,
            Name = p.Name,
            AccessToken = p.AccessToken,
            Category = p.Category,
            InstagramBusinessAccountId = p.InstagramBusinessAccount?.Id,
        }).ToList();
    }

    /// <inheritdoc />
    public async Task<Guid> ConnectPageAsync(
        Guid businessId,
        string pageId,
        string pageAccessToken,
        string pageName,
        string channelType,
        CancellationToken cancellationToken = default)
    {
        var type = channelType.Equals("Instagram", StringComparison.OrdinalIgnoreCase)
            ? ChannelType.Instagram
            : ChannelType.Facebook;

        // Check if channel already exists
        var existingChannel = await _dbContext.Channels
            .FirstOrDefaultAsync(c =>
                c.BusinessId == businessId &&
                c.Type == type &&
                c.ExternalId == pageId &&
                c.DeletedAt == null,
                cancellationToken);

        if (existingChannel != null)
        {
            // Update existing channel
            existingChannel.Credentials = pageAccessToken;
            existingChannel.Name = pageName;
            existingChannel.IsActive = true;
            existingChannel.VerificationStatus = "Verified";
            existingChannel.LastVerifiedAt = DateTime.UtcNow;
            existingChannel.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);
            LogChannelUpdated(_logger, existingChannel.Id, pageId);
            return existingChannel.Id;
        }

        // Create new channel
        var channel = new Channel
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Type = type,
            Name = pageName,
            ExternalId = pageId,
            Credentials = pageAccessToken,
            IsActive = true,
            VerificationStatus = "Verified",
            LastVerifiedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.Channels.Add(channel);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Subscribe to webhooks
        await SubscribeToWebhooksAsync(pageId, pageAccessToken, cancellationToken);

        LogChannelCreated(_logger, channel.Id, pageId);
        return channel.Id;
    }

    /// <inheritdoc />
    public async Task DisconnectAsync(Guid channelId, CancellationToken cancellationToken = default)
    {
        var channel = await _dbContext.Channels
            .FirstOrDefaultAsync(c => c.Id == channelId && c.DeletedAt == null, cancellationToken);

        if (channel == null)
        {
            return;
        }

        channel.IsActive = false;
        channel.Credentials = null;
        channel.DeletedAt = DateTime.UtcNow;
        channel.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        LogChannelDisconnected(_logger, channelId);
    }

    /// <inheritdoc />
    public async Task<bool> SubscribeToWebhooksAsync(
        string pageId,
        string pageAccessToken,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new { subscribed_fields = new[] { "messages", "messaging_postbacks" } };
            await _apiClient.PostAsync<object, object>(
                $"{pageId}/subscribed_apps",
                pageAccessToken,
                request,
                cancellationToken);

            LogWebhookSubscribed(_logger, pageId);
            return true;
        }
        catch (MetaApiException ex)
        {
            LogWebhookSubscriptionFailed(_logger, pageId, ex.Message);
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<MetaTokenRefreshResult> RefreshLongLivedTokenAsync(
        string currentToken,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _apiClient.GetLongLivedTokenAsync(currentToken, cancellationToken);

            if (response == null)
            {
                return MetaTokenRefreshResult.FailureResult("Failed to refresh token");
            }

            var expiresAt = response.ExpiresIn > 0
                ? DateTime.UtcNow.AddSeconds(response.ExpiresIn)
                : (DateTime?)null;

            LogTokenRefreshed(_logger, expiresAt);
            return MetaTokenRefreshResult.SuccessResult(response.AccessToken, expiresAt);
        }
        catch (MetaApiException ex)
        {
            LogTokenRefreshFailed(_logger, ex.Message);
            return MetaTokenRefreshResult.FailureResult(ex.Message);
        }
    }

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Token refreshed, expires at {ExpiresAt}")]
    private static partial void LogTokenRefreshed(ILogger logger, DateTime? expiresAt);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Token refresh failed: {Error}")]
    private static partial void LogTokenRefreshFailed(ILogger logger, string error);
    [LoggerMessage(Level = LogLevel.Information, Message = "OAuth successful for business {BusinessId}, found {PageCount} pages")]
    private static partial void LogOAuthSuccess(ILogger logger, Guid businessId, int pageCount);

    [LoggerMessage(Level = LogLevel.Error, Message = "OAuth error: {Message} (code: {ErrorCode})")]
    private static partial void LogOAuthError(ILogger logger, string message, int errorCode);

    [LoggerMessage(Level = LogLevel.Error, Message = "OAuth exception")]
    private static partial void LogOAuthException(ILogger logger, Exception ex);

    [LoggerMessage(Level = LogLevel.Information, Message = "Channel {ChannelId} created for page {PageId}")]
    private static partial void LogChannelCreated(ILogger logger, Guid channelId, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Channel {ChannelId} updated for page {PageId}")]
    private static partial void LogChannelUpdated(ILogger logger, Guid channelId, string pageId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Channel {ChannelId} disconnected")]
    private static partial void LogChannelDisconnected(ILogger logger, Guid channelId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Webhook subscribed for page {PageId}")]
    private static partial void LogWebhookSubscribed(ILogger logger, string pageId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Webhook subscription failed for page {PageId}: {Error}")]
    private static partial void LogWebhookSubscriptionFailed(ILogger logger, string pageId, string error);

    // Response DTOs
    private record PagesResponse
    {
        public List<PageData> Data { get; init; } = [];
    }

    private record PageData
    {
        public string Id { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string AccessToken { get; init; } = string.Empty;
        public string? Category { get; init; }
        public InstagramAccount? InstagramBusinessAccount { get; init; }
    }

    private record InstagramAccount
    {
        public string Id { get; init; } = string.Empty;
    }
}

