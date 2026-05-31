using Microsoft.AspNetCore.Authorization;

namespace QualiFlow.Infrastructure.Authorization;

/// <summary>
/// Authorization requirement for business user roles.
/// </summary>
public class BusinessRoleRequirement : IAuthorizationRequirement
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BusinessRoleRequirement"/> class.
    /// </summary>
    /// <param name="allowedRoles">The allowed business user roles.</param>
    public BusinessRoleRequirement(params string[] allowedRoles)
    {
        AllowedRoles = allowedRoles;
    }

    /// <summary>
    /// Gets the allowed business user roles.
    /// </summary>
    public IReadOnlyList<string> AllowedRoles { get; }
}

