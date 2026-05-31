using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace QualiFlow.Infrastructure.Authorization;

/// <summary>
/// Authorization handler for business user role requirements.
/// </summary>
public class BusinessRoleAuthorizationHandler : AuthorizationHandler<BusinessRoleRequirement>
{
    /// <inheritdoc/>
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        BusinessRoleRequirement requirement)
    {
        // Check if user is authenticated
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            return Task.CompletedTask;
        }

        // Check if user is NOT an admin (admins have separate authorization)
        var isAdminClaim = context.User.FindFirst("is_admin");
        if (isAdminClaim != null && isAdminClaim.Value == "true")
        {
            // Admin users should not use business user policies
            return Task.CompletedTask;
        }

        // Get user's role from claims
        var roleClaim = context.User.FindFirst(ClaimTypes.Role);

        // If no role claim, default to Owner for authenticated business users
        // This handles edge cases where role assignment may not have propagated yet
        // (e.g., immediately after registration or OAuth signup)
        var userRole = roleClaim?.Value ?? "Owner";

        // Check if user's role is in the allowed roles
        if (requirement.AllowedRoles.Contains(userRole, StringComparer.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

