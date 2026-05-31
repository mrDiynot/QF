// -----------------------------------------------------------------------
// <copyright file="TeamMemberDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.TeamMembers.DTOs;

/// <summary>
/// DTO representing a team member in a business.
/// </summary>
public sealed record TeamMemberDto
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
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>Gets the user's role in the business.</summary>
    public required string Role { get; init; }

    /// <summary>Gets the user's profile picture URL.</summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "URL is stored as string in database")]
    public string? ProfilePictureUrl { get; init; }

    /// <summary>Gets a value indicating whether the user account is active.</summary>
    public required bool IsActive { get; init; }

    /// <summary>Gets the user's last login date.</summary>
    public DateTime? LastLoginAt { get; init; }

    /// <summary>Gets the date when the user joined the business.</summary>
    public required DateTime JoinedAt { get; init; }
}

/// <summary>
/// DTO for inviting a new team member.
/// </summary>
public sealed record InviteTeamMemberRequest
{
    /// <summary>Gets the email address of the invitee.</summary>
    public required string Email { get; init; }

    /// <summary>Gets the role to assign to the invitee.</summary>
    public required string Role { get; init; }

    /// <summary>Gets an optional personal message to include in the invitation.</summary>
    public string? PersonalMessage { get; init; }
}

/// <summary>
/// DTO representing an invitation.
/// </summary>
public sealed record InvitationDto
{
    /// <summary>Gets the invitation's unique identifier.</summary>
    public required Guid Id { get; init; }

    /// <summary>Gets the invitee's email address.</summary>
    public required string Email { get; init; }

    /// <summary>Gets the role assigned to the invitation.</summary>
    public required string Role { get; init; }

    /// <summary>Gets the invitation status.</summary>
    public required string Status { get; init; }

    /// <summary>Gets the invitation expiry date.</summary>
    public required DateTime ExpiresAt { get; init; }

    /// <summary>Gets a value indicating whether the invitation is still valid.</summary>
    public required bool IsValid { get; init; }

    /// <summary>Gets the name of the user who sent the invitation.</summary>
    public required string InvitedByName { get; init; }

    /// <summary>Gets the date when the invitation was created.</summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>Gets the date when the invitation was accepted (if applicable).</summary>
    public DateTime? AcceptedAt { get; init; }
}

/// <summary>
/// DTO for updating a team member's role.
/// </summary>
public sealed record UpdateTeamMemberRoleRequest
{
    /// <summary>Gets the new role to assign.</summary>
    public required string Role { get; init; }
}

/// <summary>
/// DTO for accepting an invitation.
/// </summary>
public sealed record AcceptInvitationRequest
{
    /// <summary>Gets the invitation token.</summary>
    public required string Token { get; init; }

    /// <summary>Gets the user's first name.</summary>
    public required string FirstName { get; init; }

    /// <summary>Gets the user's last name.</summary>
    public required string LastName { get; init; }

    /// <summary>Gets the user's password (for new accounts).</summary>
    public required string Password { get; init; }
}

/// <summary>
/// Response after accepting an invitation.
/// </summary>
public sealed record AcceptInvitationResponse
{
    /// <summary>Gets the created user ID.</summary>
    public required Guid UserId { get; init; }

    /// <summary>Gets the business ID the user joined.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the business name.</summary>
    public required string BusinessName { get; init; }

    /// <summary>Gets the assigned role.</summary>
    public required string Role { get; init; }
}

