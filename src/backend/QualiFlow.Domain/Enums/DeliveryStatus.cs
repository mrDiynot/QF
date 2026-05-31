namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the delivery status of a message.
/// Tracks the lifecycle of outbound messages through the delivery pipeline.
/// </summary>
public enum DeliveryStatus
{
    /// <summary>
    /// Message has been queued for delivery but not yet sent.
    /// </summary>
    Queued = 0,

    /// <summary>
    /// Message is currently being sent to the provider (Twilio, etc.).
    /// </summary>
    Sending = 1,

    /// <summary>
    /// Message was successfully accepted by the provider.
    /// This doesn't mean it reached the recipient yet.
    /// </summary>
    Sent = 2,

    /// <summary>
    /// Message was successfully delivered to the recipient's device.
    /// Confirmed by the messaging provider.
    /// </summary>
    Delivered = 3,

    /// <summary>
    /// Message delivery failed temporarily and will be retried.
    /// </summary>
    Failed = 4,

    /// <summary>
    /// Message delivery failed permanently after all retry attempts.
    /// No further delivery attempts will be made.
    /// </summary>
    FailedPermanently = 5,

    /// <summary>
    /// Message delivery is pending (awaiting status update from provider).
    /// </summary>
    Pending = 6
}
