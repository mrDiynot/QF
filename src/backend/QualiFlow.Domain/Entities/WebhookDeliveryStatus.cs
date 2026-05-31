namespace QualiFlow.Domain.Entities;

/// <summary>
/// Webhook delivery status enumeration.
/// </summary>
public enum WebhookDeliveryStatus
{
    /// <summary>
    /// Delivery is pending (not yet attempted).
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Delivery succeeded (HTTP 2xx response).
    /// </summary>
    Success = 1,

    /// <summary>
    /// Delivery failed and will be retried.
    /// </summary>
    Failed = 2,

    /// <summary>
    /// Delivery failed permanently (max retries exceeded).
    /// </summary>
    FailedPermanently = 3,
}

