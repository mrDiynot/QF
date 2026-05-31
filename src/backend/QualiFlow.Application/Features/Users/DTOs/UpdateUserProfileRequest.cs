// -----------------------------------------------------------------------
// <copyright file="UpdateUserProfileRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Users.DTOs;

/// <summary>
/// Request DTO for updating user profile information.
/// </summary>
public sealed record UpdateUserProfileRequest
{
    /// <summary>Gets the user's first name.</summary>
    public string? FirstName { get; init; }

    /// <summary>Gets the user's last name.</summary>
    public string? LastName { get; init; }

    /// <summary>Gets the user's phone number.</summary>
    public string? PhoneNumber { get; init; }

    /// <summary>Gets the user's profile picture URL.</summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage(
        "Design",
        "CA1056:URI-like properties should not be strings",
        Justification = "Stored as string in database for simplicity and ORM compatibility")]
    public string? ProfilePictureUrl { get; init; }
}

