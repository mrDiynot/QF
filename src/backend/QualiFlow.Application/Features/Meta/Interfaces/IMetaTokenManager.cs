namespace QualiFlow.Application.Features.Meta.Interfaces;

/// <summary>
/// Manages Meta access tokens for pages and Instagram accounts.
/// Handles token storage, retrieval, and refresh.
/// </summary>
public interface IMetaTokenManager
{
    /// <summary>
    /// Gets the access token for a specific page.
    /// </summary>
    /// <param name="pageId">The Meta Page ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The access token, or null if not found.</returns>
    Task<string?> GetAccessTokenForPageAsync(string pageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the access token for a channel.
    /// </summary>
    /// <param name="channelId">The QualiFlow channel ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The access token, or null if not found.</returns>
    Task<string?> GetAccessTokenForChannelAsync(Guid channelId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Stores an access token for a page.
    /// </summary>
    /// <param name="pageId">The Meta Page ID.</param>
    /// <param name="accessToken">The access token.</param>
    /// <param name="expiresAt">When the token expires.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task StoreAccessTokenAsync(
        string pageId,
        string accessToken,
        DateTime? expiresAt,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refreshes an access token if it's about to expire.
    /// </summary>
    /// <param name="pageId">The Meta Page ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the token was refreshed.</returns>
    Task<bool> RefreshTokenIfNeededAsync(string pageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates that a token is still valid.
    /// </summary>
    /// <param name="accessToken">The access token to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the token is valid.</returns>
    Task<bool> ValidateTokenAsync(string accessToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Revokes an access token.
    /// </summary>
    /// <param name="pageId">The Meta Page ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RevokeTokenAsync(string pageId, CancellationToken cancellationToken = default);
}

