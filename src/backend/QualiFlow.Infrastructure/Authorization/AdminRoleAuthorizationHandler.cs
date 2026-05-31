using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Authorization;

/// <summary>
/// Authorization handler for admin role requirements.
/// </summary>
public class AdminRoleAuthorizationHandler : AuthorizationHandler<AdminRoleRequirement>
{
    /// <inheritdoc/>
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminRoleRequirement requirement)
    {
        // Check if user is authenticated
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            return Task.CompletedTask;
        }

        // Check if user has is_admin claim
        var isAdminClaim = context.User.FindFirst("is_admin");
        if (isAdminClaim == null || isAdminClaim.Value != "true")
        {
            return Task.CompletedTask;
        }

        // Get admin role from claims
        var adminRoleClaim = context.User.FindFirst("admin_role");
        if (adminRoleClaim == null)
        {
            return Task.CompletedTask;
        }

        // Parse admin role
        if (!Enum.TryParse<AdminRole>(adminRoleClaim.Value, out var adminRole))
        {
            return Task.CompletedTask;
        }

        // Check if user's role is in the allowed roles
        if (requirement.AllowedRoles.Contains(adminRole))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

