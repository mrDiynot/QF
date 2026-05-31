namespace QualiFlow.Domain.Entities;

/// <summary>
/// Webhook status enumeration.
/// </summary>
public enum WebhookStatus
{
    /// <summary>
    /// Webhook is active and receiving events.
    /// </summary>
    Active = 0,

    /// <summary>
    /// Webhook is paused (manually disabled by user).
    /// </summary>
    Paused = 1,

    /// <summary>
    /// Webhook is disabled due to too many failures.
    /// </summary>
    Disabled = 2,
}

