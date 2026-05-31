namespace QualiFlow.Domain.Enums;

/// <summary>
/// Subscription status for billing and access control.
/// </summary>
public enum SubscriptionStatus
{
    /// <summary>
    /// Trial period - 14 days free access with limited features.
    /// </summary>
    Trial = 0,

    /// <summary>
    /// Active subscription - full access to tier features.
    /// </summary>
    Active = 1,

    /// <summary>
    /// Suspended - payment failed, read-only access during 7-day grace period.
    /// </summary>
    Suspended = 2,

    /// <summary>
    /// Cancelled - subscription cancelled, read-only access until period end.
    /// </summary>
    Cancelled = 3,

    /// <summary>
    /// Expired - trial or subscription ended, no access.
    /// </summary>
    Expired = 4
}

