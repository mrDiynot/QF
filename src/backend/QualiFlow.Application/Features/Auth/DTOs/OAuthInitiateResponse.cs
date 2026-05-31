using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for OAuth initiation.
/// Contains the URL to redirect the user to for OAuth authentication.
/// </summary>
public sealed record OAuthInitiateResponse
{
    /// <summary>
    /// Gets the URL to redirect the user to for OAuth authentication.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Used for JSON serialization")]
    public required string AuthorizationUrl { get; init; }

    /// <summary>
    /// Gets the state parameter for CSRF protection.
    /// This value should be verified in the callback.
    /// </summary>
    public required string State { get; init; }

    /// <summary>
    /// Gets the OAuth provider name.
    /// </summary>
    public string Provider { get; init; } = "Google";
}

