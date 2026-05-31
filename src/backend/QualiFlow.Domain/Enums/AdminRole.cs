namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the different admin roles in the QualiFlow platform.
/// </summary>
public enum AdminRole
{
    /// <summary>
    /// No admin role assigned.
    /// </summary>
    None = 0,

    /// <summary>
    /// Super Administrator - Full access to all platform features including admin user management.
    /// Can create, update, and delete other admin users.
    /// </summary>
    SuperAdmin = 1,

    /// <summary>
    /// Platform Administrator - Full access to all admin features except admin user management.
    /// </summary>
    PlatformAdmin = 2,

    /// <summary>
    /// Support Administrator - Access to customer support tools only.
    /// </summary>
    SupportAdmin = 3,

    /// <summary>
    /// Billing Administrator - Access to billing and subscription management only.
    /// </summary>
    BillingAdmin = 4,

    /// <summary>
    /// Content Administrator - Access to content management only.
    /// </summary>
    ContentAdmin = 5
}

