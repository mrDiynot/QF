namespace QualiFlow.Application.Features.Admin.Authorization;

/// <summary>
/// Constants for admin authorization policies.
/// </summary>
public static class AdminPolicies
{
    /// <summary>
    /// Policy that requires Platform Admin role (full access to all admin features).
    /// </summary>
    public const string RequirePlatformAdmin = "RequirePlatformAdmin";

    /// <summary>
    /// Policy that requires Support Admin role (user management + customer support).
    /// </summary>
    public const string RequireSupportAdmin = "RequireSupportAdmin";

    /// <summary>
    /// Policy that requires Billing Admin role (subscription and billing management).
    /// </summary>
    public const string RequireBillingAdmin = "RequireBillingAdmin";

    /// <summary>
    /// Policy that requires Content Admin role (content management).
    /// </summary>
    public const string RequireContentAdmin = "RequireContentAdmin";

    /// <summary>
    /// Policy that requires any admin role (authenticated admin user).
    /// </summary>
    public const string RequireAnyAdmin = "RequireAnyAdmin";
}

