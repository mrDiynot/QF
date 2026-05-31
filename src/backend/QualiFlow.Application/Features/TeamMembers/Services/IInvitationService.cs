// -----------------------------------------------------------------------
// <copyright file="IInvitationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.TeamMembers.DTOs;

namespace QualiFlow.Application.Features.TeamMembers.Services;

/// <summary>
/// Service interface for invitation management operations.
/// INVEST User Story:
/// As a business Owner/Admin, I want to invite new team members via email
/// so that I can grow my team and delegate work.
///
/// Acceptance Criteria:
/// - Given I provide a valid email, When I send invitation, Then invitee receives email with link.
/// - Given invitation exists, When invitee clicks link, Then they can create account and join.
/// - Given invitation is pending, When I resend, Then new email is sent with fresh expiry.
/// - Given invitation is pending, When 7 days pass, Then invitation status becomes Expired.
/// - Given I am Owner/Admin, When I cancel invitation, Then link becomes invalid.
/// </summary>
public interface IInvitationService
{
    /// <summary>
    /// Sends an invitation to join a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The invitation request.</param>
    /// <param name="invitedByUserId">The user sending the invitation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created invitation.</returns>
    Task<InvitationDto> InviteAsync(
        Guid businessId,
        InviteTeamMemberRequest request,
        Guid invitedByUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all pending invitations for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pending invitations.</returns>
    Task<IReadOnlyList<InvitationDto>> GetPendingInvitationsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an invitation by its token.
    /// </summary>
    /// <param name="token">The invitation token.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The invitation if found and valid.</returns>
    Task<InvitationDto?> GetByTokenAsync(
        string token,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Accepts an invitation and creates the user account.
    /// </summary>
    /// <param name="request">The acceptance request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The acceptance response.</returns>
    Task<AcceptInvitationResponse> AcceptAsync(
        AcceptInvitationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Resends an invitation email.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="invitationId">The invitation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated invitation.</returns>
    Task<InvitationDto> ResendAsync(
        Guid businessId,
        Guid invitationId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a pending invitation.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="invitationId">The invitation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CancelAsync(
        Guid businessId,
        Guid invitationId,
        CancellationToken cancellationToken = default);
}

