// -----------------------------------------------------------------------
// <copyright file="TeamMemberService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.TeamMembers.DTOs;
using QualiFlow.Application.Features.TeamMembers.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Implementation of team member management service.
/// </summary>
public partial class TeamMemberService : ITeamMemberService
{
    private readonly QualiFlowDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<TeamMemberService> _logger;

    public TeamMemberService(
        QualiFlowDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<TeamMemberService> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<TeamMemberDto>> GetAllAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        LogGettingTeamMembers(businessId);

        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.BusinessId == businessId)
            .OrderBy(u => u.CreatedAt)
            .ToListAsync(cancellationToken);

        var teamMembers = new List<TeamMemberDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            teamMembers.Add(MapToDto(user, roles.FirstOrDefault() ?? "Viewer"));
        }

        LogTeamMembersRetrieved(businessId, teamMembers.Count);
        return teamMembers;
    }

    /// <inheritdoc/>
    public async Task<TeamMemberDto?> GetByIdAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && u.BusinessId == businessId, cancellationToken);

        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        return MapToDto(user, roles.FirstOrDefault() ?? "Viewer");
    }

    /// <inheritdoc/>
    public async Task<TeamMemberDto> UpdateRoleAsync(
        Guid businessId,
        Guid userId,
        string newRole,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        LogUpdatingRole(businessId, userId, newRole, requestingUserId);

        // Validate role
        if (!ApplicationRole.IsValidRole(newRole))
        {
            throw new ArgumentException($"Invalid role: {newRole}", nameof(newRole));
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.BusinessId == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"User {userId} not found in business {businessId}");

        // Cannot change own role
        if (userId == requestingUserId)
        {
            throw new InvalidOperationException("Cannot change your own role");
        }

        // Get current roles and remove them
        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Any())
        {
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
        }

        // Add new role
        await _userManager.AddToRoleAsync(user, newRole);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        LogRoleUpdated(businessId, userId, newRole);
        return MapToDto(user, newRole);
    }

    /// <inheritdoc/>
    public async Task RemoveAsync(
        Guid businessId,
        Guid userId,
        Guid requestingUserId,
        CancellationToken cancellationToken = default)
    {
        LogRemovingMember(businessId, userId, requestingUserId);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.BusinessId == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"User {userId} not found in business {businessId}");

        // Cannot remove self
        if (userId == requestingUserId)
        {
            throw new InvalidOperationException("Cannot remove yourself from the business");
        }

        // Check if user is Owner - cannot remove last owner
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains(ApplicationRole.Owner))
        {
            var ownerCount = await _context.Users
                .CountAsync(
                    u => u.BusinessId == businessId &&
                        _context.UserRoles.Any(ur => ur.UserId == u.Id &&
                            _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == ApplicationRole.Owner)),
                    cancellationToken);

            if (ownerCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last owner of the business");
            }
        }

        // Soft delete - deactivate the user
        user.IsActive = false;
        user.BusinessId = Guid.Empty; // Disassociate from business
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        LogMemberRemoved(businessId, userId);
    }

    private static TeamMemberDto MapToDto(ApplicationUser user, string role) => new()
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Role = role,
        ProfilePictureUrl = user.ProfilePictureUrl,
        IsActive = user.IsActive,
        LastLoginAt = user.LastLoginAt,
        JoinedAt = user.CreatedAt
    };

    // Logging methods
    [LoggerMessage(Level = LogLevel.Information, Message = "Getting team members for business {BusinessId}")]
    private partial void LogGettingTeamMembers(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Retrieved {Count} team members for business {BusinessId}")]
    private partial void LogTeamMembersRetrieved(Guid businessId, int count);

    [LoggerMessage(Level = LogLevel.Information, Message = "Updating role for user {UserId} in business {BusinessId} to {NewRole} by user {RequestingUserId}")]
    private partial void LogUpdatingRole(Guid businessId, Guid userId, string newRole, Guid requestingUserId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Role updated for user {UserId} in business {BusinessId} to {NewRole}")]
    private partial void LogRoleUpdated(Guid businessId, Guid userId, string newRole);

    [LoggerMessage(Level = LogLevel.Information, Message = "Removing user {UserId} from business {BusinessId} by user {RequestingUserId}")]
    private partial void LogRemovingMember(Guid businessId, Guid userId, Guid requestingUserId);

    [LoggerMessage(Level = LogLevel.Information, Message = "User {UserId} removed from business {BusinessId}")]
    private partial void LogMemberRemoved(Guid businessId, Guid userId);
}

