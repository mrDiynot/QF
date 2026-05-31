namespace QualiFlow.Application.Features.Meta.Interfaces;

/// <summary>
/// Service for Meta OAuth flow to connect Facebook Pages and Instagram accounts.
/// </summary>
public interface IMetaOAuthService
{
    /// <summary>
    /// Generates the OAuth authorization URL for connecting a Facebook Page.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="state">State parameter for CSRF protection.</param>
    /// <param name="channelType">The channel type (Facebook or Instagram).</param>
    /// <returns>The authorization URL to redirect the user to.</returns>
#pragma warning disable CA1055 // URI-like properties should not be strings
    string GetAuthorizationUrl(Guid businessId, string state, string channelType);
#pragma warning restore CA1055

    /// <summary>
    /// Handles the OAuth callback and exchanges the code for tokens.
    /// </summary>
    /// <param name="code">The authorization code from Meta.</param>
    /// <param name="state">The state parameter for verification.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the OAuth callback.</returns>
    Task<MetaOAuthCallbackResult> HandleCallbackAsync(
        string code,
        string state,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the list of Facebook Pages the user has access to.
    /// </summary>
    /// <param name="userAccessToken">The user's access token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pages with their access tokens.</returns>
    Task<IReadOnlyList<MetaPageInfo>> GetUserPagesAsync(
        string userAccessToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Connects a Facebook Page to a business channel.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="pageId">The Facebook Page ID.</param>
    /// <param name="pageAccessToken">The page access token.</param>
    /// <param name="pageName">The page name.</param>
    /// <param name="channelType">The channel type (Facebook or Instagram).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created channel ID.</returns>
    Task<Guid> ConnectPageAsync(
        Guid businessId,
        string pageId,
        string pageAccessToken,
        string pageName,
        string channelType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disconnects a Meta channel.
    /// </summary>
    /// <param name="channelId">The channel ID to disconnect.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DisconnectAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Subscribes a page to webhook events.
    /// </summary>
    /// <param name="pageId">The Facebook Page ID.</param>
    /// <param name="pageAccessToken">The page access token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if subscription was successful.</returns>
    Task<bool> SubscribeToWebhooksAsync(
        string pageId,
        string pageAccessToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refreshes a long-lived access token.
    /// </summary>
    /// <param name="currentToken">The current long-lived token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the token refresh.</returns>
    Task<MetaTokenRefreshResult> RefreshLongLivedTokenAsync(
        string currentToken,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a token refresh operation.
/// </summary>
public record MetaTokenRefreshResult
{
    /// <summary>
    /// Gets a value indicating whether the refresh was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the new access token.
    /// </summary>
    public string? AccessToken { get; init; }

    /// <summary>
    /// Gets when the token expires.
    /// </summary>
    public DateTime? ExpiresAt { get; init; }

    /// <summary>
    /// Gets the error message if the refresh failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <returns>A successful token refresh result.</returns>
    public static MetaTokenRefreshResult SuccessResult(string accessToken, DateTime? expiresAt) =>
        new() { Success = true, AccessToken = accessToken, ExpiresAt = expiresAt };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    /// <returns>A failed token refresh result.</returns>
    public static MetaTokenRefreshResult FailureResult(string errorMessage) =>
        new() { Success = false, ErrorMessage = errorMessage };
}

/// <summary>
/// Result of the OAuth callback.
/// </summary>
public record MetaOAuthCallbackResult
{
    /// <summary>
    /// Gets a value indicating whether the callback was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the user access token.
    /// </summary>
    public string? UserAccessToken { get; init; }

    /// <summary>
    /// Gets the business ID from the state.
    /// </summary>
    public Guid? BusinessId { get; init; }

    /// <summary>
    /// Gets the channel type from the state.
    /// </summary>
    public string? ChannelType { get; init; }

    /// <summary>
    /// Gets the list of available pages.
    /// </summary>
    public IReadOnlyList<MetaPageInfo>? Pages { get; init; }

    /// <summary>
    /// Gets the error message if the callback failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <returns>A successful callback result.</returns>
    public static MetaOAuthCallbackResult SuccessResult(
        string userAccessToken,
        Guid businessId,
        string channelType,
        IReadOnlyList<MetaPageInfo> pages) =>
        new()
        {
            Success = true,
            UserAccessToken = userAccessToken,
            BusinessId = businessId,
            ChannelType = channelType,
            Pages = pages,
        };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    /// <returns>A failed callback result.</returns>
    public static MetaOAuthCallbackResult FailureResult(string errorMessage) =>
        new() { Success = false, ErrorMessage = errorMessage };
}

/// <summary>
/// Information about a Facebook Page.
/// </summary>
public record MetaPageInfo
{
    /// <summary>
    /// Gets the page ID.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page access token.
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Gets the page category.
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Gets the Instagram Business Account ID linked to this page.
    /// </summary>
    public string? InstagramBusinessAccountId { get; init; }
}

