// -----------------------------------------------------------------------
// <copyright file="UserProfileResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Users.DTOs;

/// <summary>
/// Response DTO for user profile information.
/// </summary>
public sealed record UserProfileResponse
{
    /// <summary>Gets the user's unique identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the user's email address.</summary>
    public required string Email { get; init; }

    /// <summary>Gets the user's first name.</summary>
    public required string FirstName { get; init; }

    /// <summary>Gets the user's last name.</summary>
    public required string LastName { get; init; }

    /// <summary>Gets the user's full name.</summary>
    public required string FullName { get; init; }

    /// <summary>Gets the user's phone number.</summary>
    public string? PhoneNumber { get; init; }

    /// <summary>Gets the user's profile picture URL.</summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage(
        "Design",
        "CA1056:URI-like properties should not be strings",
        Justification = "Stored as string in database for simplicity and ORM compatibility")]
    public string? ProfilePictureUrl { get; init; }

    /// <summary>Gets the business ID the user belongs to.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public required string BusinessName { get; init; }

    /// <summary>Gets a value indicating whether the user is active.</summary>
    public required bool IsActive { get; init; }

    /// <summary>Gets a value indicating whether the user registered via OAuth.</summary>
    public bool IsOAuthUser { get; init; }

    /// <summary>Gets the OAuth provider name if applicable.</summary>
    public string? OAuthProvider { get; init; }

    /// <summary>Gets the date and time when the user was created.</summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>Gets the date and time when the user was last updated.</summary>
    public DateTime? UpdatedAt { get; init; }
}

