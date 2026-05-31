using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// Response DTO for OAuth status information.
/// </summary>
public sealed record OAuthStatusResponse
{
    /// <summary>
    /// Gets a value indicating whether the user has Google OAuth linked.
    /// </summary>
    public bool HasGoogleLinked { get; init; }

    /// <summary>
    /// Gets the linked Google email address.
    /// </summary>
    public string? GoogleEmail { get; init; }

    /// <summary>
    /// Gets the Google profile picture URL.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Used for JSON serialization")]
    public string? GoogleProfilePicture { get; init; }

    /// <summary>
    /// Gets the date when Google was linked.
    /// </summary>
    public DateTime? GoogleLinkedAt { get; init; }
}

