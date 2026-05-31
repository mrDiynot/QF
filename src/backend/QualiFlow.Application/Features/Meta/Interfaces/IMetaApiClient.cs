namespace QualiFlow.Application.Features.Meta.Interfaces;

/// <summary>
/// HTTP client for Meta Graph API operations.
/// </summary>
public interface IMetaApiClient
{
    /// <summary>
    /// Sends a GET request to the Meta Graph API.
    /// </summary>
    /// <typeparam name="T">The response type.</typeparam>
    /// <param name="endpoint">The API endpoint (relative to Graph API base URL).</param>
    /// <param name="accessToken">The access token for authentication.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deserialized response.</returns>
    Task<T?> GetAsync<T>(string endpoint, string accessToken, CancellationToken cancellationToken = default)
        where T : class;

    /// <summary>
    /// Sends a POST request to the Meta Graph API.
    /// </summary>
    /// <typeparam name="TRequest">The request body type.</typeparam>
    /// <typeparam name="TResponse">The response type.</typeparam>
    /// <param name="endpoint">The API endpoint (relative to Graph API base URL).</param>
    /// <param name="accessToken">The access token for authentication.</param>
    /// <param name="body">The request body.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deserialized response.</returns>
    Task<TResponse?> PostAsync<TRequest, TResponse>(
        string endpoint,
        string accessToken,
        TRequest body,
        CancellationToken cancellationToken = default)
        where TRequest : class
        where TResponse : class;

    /// <summary>
    /// Exchanges an authorization code for an access token.
    /// </summary>
    /// <param name="code">The authorization code from OAuth callback.</param>
    /// <param name="redirectUri">The redirect URI used in the OAuth flow.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The access token response.</returns>
#pragma warning disable CA1054 // URI-like properties should not be strings
    Task<MetaTokenResponse?> ExchangeCodeForTokenAsync(
        string code,
        string redirectUri,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054

    /// <summary>
    /// Exchanges a short-lived token for a long-lived token.
    /// </summary>
    /// <param name="shortLivedToken">The short-lived access token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The long-lived access token response.</returns>
    Task<MetaTokenResponse?> GetLongLivedTokenAsync(
        string shortLivedToken,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates an access token and returns debug info.
    /// </summary>
    /// <param name="accessToken">The access token to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The token debug info.</returns>
    Task<MetaTokenDebugInfo?> DebugTokenAsync(
        string accessToken,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Response from Meta OAuth token exchange.
/// </summary>
public record MetaTokenResponse
{
    /// <summary>
    /// Gets the access token.
    /// </summary>
    public string AccessToken { get; init; } = string.Empty;

    /// <summary>
    /// Gets the token type (usually "bearer").
    /// </summary>
    public string TokenType { get; init; } = "bearer";

    /// <summary>
    /// Gets the token expiration time in seconds.
    /// </summary>
    public long ExpiresIn { get; init; }
}

/// <summary>
/// Debug information for a Meta access token.
/// </summary>
public record MetaTokenDebugInfo
{
    /// <summary>
    /// Gets the App ID the token was issued for.
    /// </summary>
    public string AppId { get; init; } = string.Empty;

    /// <summary>
    /// Gets the user ID (PSID) for the token.
    /// </summary>
    public string UserId { get; init; } = string.Empty;

    /// <summary>
    /// Gets the data expiration timestamp.
    /// </summary>
    public long DataAccessExpiresAt { get; init; }

    /// <summary>
    /// Gets the token expiration timestamp.
    /// </summary>
    public long ExpiresAt { get; init; }

    /// <summary>
    /// Gets a value indicating whether the token is valid.
    /// </summary>
    public bool IsValid { get; init; }

    /// <summary>
    /// Gets the scopes granted to this token.
    /// </summary>
    public IReadOnlyList<string> Scopes { get; init; } = [];

    /// <summary>
    /// Gets the error if the token is invalid.
    /// </summary>
    public MetaTokenError? Error { get; init; }
}

/// <summary>
/// Error information for an invalid Meta token.
/// </summary>
public record MetaTokenError
{
    /// <summary>
    /// Gets the error code.
    /// </summary>
    public int Code { get; init; }

    /// <summary>
    /// Gets the error message.
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// Gets the error subcode.
    /// </summary>
    public int Subcode { get; init; }
}

