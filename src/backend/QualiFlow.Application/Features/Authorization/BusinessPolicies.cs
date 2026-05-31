namespace QualiFlow.Application.Features.Authorization;

/// <summary>
/// Constants for business user authorization policies.
/// </summary>
public static class BusinessPolicies
{
    /// <summary>
    /// Policy that requires Owner role (full access to all business features).
    /// </summary>
    public const string RequireOwner = "RequireOwner";

    /// <summary>
    /// Policy that requires Admin or Owner role (administrative access).
    /// </summary>
    public const string RequireAdminOrOwner = "RequireAdminOrOwner";

    /// <summary>
    /// Policy that requires Manager, Admin, or Owner role (operational access).
    /// </summary>
    public const string RequireManagerOrHigher = "RequireManagerOrHigher";

    /// <summary>
    /// Policy that requires any authenticated business user (all roles).
    /// </summary>
    public const string RequireBusinessUser = "RequireBusinessUser";
}

