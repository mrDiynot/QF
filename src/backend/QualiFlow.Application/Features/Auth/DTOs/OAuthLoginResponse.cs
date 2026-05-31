using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for OAuth login operations.
/// Extends the standard login response with OAuth-specific information.
/// </summary>
public sealed record OAuthLoginResponse
{
    /// <summary>
    /// Gets the JWT access token.
    /// </summary>
    public required string AccessToken { get; init; }

    /// <summary>
    /// Gets the refresh token.
    /// </summary>
    public required string RefreshToken { get; init; }

    /// <summary>
    /// Gets the token expiration time.
    /// </summary>
    public required DateTime ExpiresAt { get; init; }

    /// <summary>
    /// Gets the token type (always "Bearer").
    /// </summary>
    public string TokenType { get; init; } = "Bearer";

    /// <summary>
    /// Gets the user ID.
    /// </summary>
    public required Guid UserId { get; init; }

    /// <summary>
    /// Gets the user's email address.
    /// </summary>
    public required string Email { get; init; }

    /// <summary>
    /// Gets the user's full name.
    /// </summary>
    public required string FullName { get; init; }

    /// <summary>
    /// Gets the user's first name.
    /// </summary>
    public string? FirstName { get; init; }

    /// <summary>
    /// Gets the user's last name.
    /// </summary>
    public string? LastName { get; init; }

    /// <summary>
    /// Gets the business ID the user belongs to.
    /// </summary>
    public Guid? BusinessId { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is a new user registration.
    /// </summary>
    public bool IsNewUser { get; init; }

    /// <summary>
    /// Gets the OAuth provider used for authentication.
    /// </summary>
    public string Provider { get; init; } = "Google";

    /// <summary>
    /// Gets the user's profile picture URL from the OAuth provider.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Used for JSON serialization")]
    public string? ProfilePictureUrl { get; init; }
}

