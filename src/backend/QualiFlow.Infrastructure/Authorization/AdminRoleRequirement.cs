using Microsoft.AspNetCore.Authorization;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Infrastructure.Authorization;

/// <summary>
/// Authorization requirement for admin roles.
/// </summary>
public class AdminRoleRequirement : IAuthorizationRequirement
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AdminRoleRequirement"/> class.
    /// </summary>
    /// <param name="allowedRoles">The allowed admin roles.</param>
    public AdminRoleRequirement(params AdminRole[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }

    /// <summary>
    /// Gets the allowed admin roles.
    /// </summary>
    public IReadOnlyList<AdminRole> AllowedRoles { get; }
}

