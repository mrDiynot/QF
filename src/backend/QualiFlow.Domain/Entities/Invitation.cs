// -----------------------------------------------------------------------
// <copyright file="Invitation.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an invitation to join a business as a team member.
/// INVEST Specification:
/// - Independent: Can be created/managed without affecting other entities.
/// - Negotiable: Role and expiry can be configured per business needs.
/// - Valuable: Enables team growth and collaboration within businesses.
/// - Estimable: Well-defined CRUD operations with clear scope.
/// - Small: Single responsibility - manage invitations.
/// - Testable: Clear acceptance criteria for each status transition.
/// </summary>
public class Invitation
{
    /// <summary>Gets or sets the unique identifier.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Gets or sets the business ID (tenant). Required for multi-tenancy.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the email address of the invitee.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Gets or sets the role assigned to the invitee upon acceptance.</summary>
    public string Role { get; set; } = ApplicationRole.Viewer;

    /// <summary>Gets or sets the user ID who sent the invitation.</summary>
    public Guid InvitedByUserId { get; set; }

    /// <summary>Gets or sets the secure token for invitation acceptance.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Gets or sets the invitation expiry date (default: 7 days).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Gets or sets the current status of the invitation.</summary>
    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

    /// <summary>Gets or sets the date when the invitation was accepted.</summary>
    public DateTime? AcceptedAt { get; set; }

    /// <summary>Gets or sets the user ID of the accepted user (after acceptance).</summary>
    public Guid? AcceptedByUserId { get; set; }

    /// <summary>Gets or sets the creation timestamp.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Gets or sets the last update timestamp.</summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties

    /// <summary>Gets or sets the business this invitation belongs to.</summary>
    public Business Business { get; set; } = null!;

    /// <summary>Gets or sets the user who sent the invitation.</summary>
    public ApplicationUser? InvitedByUser { get; set; }

    /// <summary>Gets or sets the user who accepted the invitation (if accepted).</summary>
    public ApplicationUser? AcceptedByUser { get; set; }

    // Helper methods

    /// <summary>
    /// Gets a value indicating whether the invitation is still valid (pending and not expired).
    /// </summary>
    public bool IsValid => Status == InvitationStatus.Pending && ExpiresAt > DateTime.UtcNow;

    /// <summary>
    /// Generates a new secure invitation token.
    /// </summary>
    /// <returns>A URL-safe base64 encoded token string.</returns>
    public static string GenerateToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
            .Replace("/", "_", StringComparison.Ordinal)
            .Replace("+", "-", StringComparison.Ordinal)
            .TrimEnd('=');
    }
}

