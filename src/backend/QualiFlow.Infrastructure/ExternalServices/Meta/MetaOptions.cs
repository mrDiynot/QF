#pragma warning disable CA1056 // URI-like properties should not be strings

namespace QualiFlow.Infrastructure.ExternalServices.Meta;

/// <summary>
/// Configuration options for Meta (Facebook/Instagram) integration.
/// </summary>
public class MetaOptions
{
    /// <summary>
    /// Configuration section name.
    /// </summary>
    public const string SectionName = "Meta";

    /// <summary>
    /// Gets or sets the Meta App ID.
    /// </summary>
    public string AppId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Meta App Secret.
    /// </summary>
    public string AppSecret { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the webhook verification token.
    /// Must match the token configured in Meta Developer Console.
    /// </summary>
    public string VerifyToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Meta Graph API version (e.g., "v24.0").
    /// </summary>
    public string GraphApiVersion { get; set; } = "v24.0";

    /// <summary>
    /// Gets or sets the base URL for webhooks.
    /// </summary>
    public string WebhookBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the encryption key for storing access tokens.
    /// </summary>
    public string TokenEncryptionKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the OAuth redirect URI.
    /// </summary>
    public string OAuthRedirectUri { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the frontend callback URL for redirecting after OAuth completion.
    /// </summary>
    public string FrontendCallbackUrl { get; set; } = "http://localhost:3000/channels/meta/callback";

    /// <summary>
    /// Gets or sets the page access token for testing (development only).
    /// </summary>
    public string? PageAccessToken { get; set; }

    /// <summary>
    /// Gets the Graph API base URL with version.
    /// </summary>
    public string GraphApiBaseUrl => $"https://graph.facebook.com/{GraphApiVersion}";

    /// <summary>
    /// Validates the configuration.
    /// </summary>
    /// <returns>True if the configuration is valid for basic operations.</returns>
    public bool IsValid() => !string.IsNullOrEmpty(AppId) && !string.IsNullOrEmpty(VerifyToken);

    /// <summary>
    /// Validates the configuration for OAuth operations.
    /// </summary>
    /// <returns>True if the configuration is valid for OAuth.</returns>
    public bool IsValidForOAuth() =>
        !string.IsNullOrEmpty(AppId) &&
        !string.IsNullOrEmpty(AppSecret) &&
        !string.IsNullOrEmpty(OAuthRedirectUri);

    /// <summary>
    /// Validates the configuration for messaging operations.
    /// </summary>
    /// <returns>True if the configuration is valid for sending messages.</returns>
    public bool IsValidForMessaging() =>
        !string.IsNullOrEmpty(AppId) &&
        !string.IsNullOrEmpty(AppSecret);
}

