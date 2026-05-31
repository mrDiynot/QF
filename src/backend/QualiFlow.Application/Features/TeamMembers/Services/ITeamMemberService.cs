// -----------------------------------------------------------------------
// <copyright file="ITeamMemberService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.TeamMembers.DTOs;

namespace QualiFlow.Application.Features.TeamMembers.Services;

/// <summary>
/// Service interface for team member management operations.
/// INVEST User Story:
/// As a business Owner/Admin, I want to manage my team members
/// so that I can collaborate with my team on lead qualification.
///
/// Acceptance Criteria:
/// - Given I am an Owner/Admin, When I view team members, Then I see all users in my business.
/// - Given I am an Owner/Admin, When I invite a user, Then they receive an email invitation.
/// - Given I am an Owner, When I change a member's role, Then their permissions update immediately.
/// - Given I am an Owner/Admin, When I remove a member, Then they lose access to the business.
/// </summary>
public interface ITeamMemberService
{
    /// <summary>
    /// Gets all team members for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of team members.</returns>
    Task<IReadOnlyList<TeamMemberDto>> GetAllAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific team member by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The team member if found.</returns>
    Task<TeamMemberDto?> GetByIdAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a team member's role.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID to update.</param>
    /// <param name="newRole">The new role.</param>
    /// <param name="requestingUserId">The ID of the user making the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated team member.</returns>
    Task<TeamMemberDto> UpdateRoleAsync(
        Guid businessId,
        Guid userId,
        string newRole,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a team member from the business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID to remove.</param>
    /// <param name="requestingUserId">The ID of the user making the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RemoveAsync(
        Guid businessId,
        Guid userId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default);
}

