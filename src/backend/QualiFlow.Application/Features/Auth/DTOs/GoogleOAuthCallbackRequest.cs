namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Request DTO for handling Google OAuth callback.
/// Contains the authorization code returned by Google.
/// </summary>
public sealed record GoogleOAuthCallbackRequest
{
    /// <summary>
    /// Gets the authorization code from Google OAuth.
    /// </summary>
    public required string Code { get; init; }

    /// <summary>
    /// Gets the state parameter for CSRF protection.
    /// </summary>
    public string? State { get; init; }

    /// <summary>
    /// Gets any error returned by Google.
    /// </summary>
    public string? Error { get; init; }

    /// <summary>
    /// Gets the error description from Google.
    /// </summary>
    public string? ErrorDescription { get; init; }
}

