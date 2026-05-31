using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a single webhook delivery attempt with status and response tracking.
/// Used for debugging, monitoring, and retry logic.
/// </summary>
public class WebhookDelivery : BaseEntity
{
    /// <summary>
    /// Gets or sets the webhook ID this delivery belongs to.
    /// </summary>
    public Guid WebhookId { get; set; }

    /// <summary>
    /// Gets or sets the event type that triggered this delivery.
    /// Examples: "lead.created", "lead.qualified", "conversation.message_received".
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the JSON payload sent to the webhook URL.
    /// </summary>
    public string Payload { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the delivery status.
    /// </summary>
    public WebhookDeliveryStatus Status { get; set; } = WebhookDeliveryStatus.Pending;

    /// <summary>
    /// Gets or sets the number of delivery attempts made.
    /// Maximum 5 attempts with exponential backoff.
    /// </summary>
    public int Attempts { get; set; }

    /// <summary>
    /// Gets or sets the timestamp for the next retry attempt.
    /// Null if no retry is scheduled.
    /// </summary>
    public DateTime? NextRetryAt { get; set; }

    /// <summary>
    /// Gets or sets the HTTP response status code from the webhook endpoint.
    /// </summary>
    public int? ResponseCode { get; set; }

    /// <summary>
    /// Gets or sets the HTTP response body from the webhook endpoint.
    /// Truncated to 5000 characters for storage efficiency.
    /// </summary>
    public string? ResponseBody { get; set; }

    /// <summary>
    /// Gets or sets the error message if delivery failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the duration of the HTTP request in milliseconds.
    /// </summary>
    public int? DurationMs { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when delivery was completed (success or final failure).
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the webhook that this delivery belongs to.
    /// </summary>
    public Webhook Webhook { get; set; } = null!;
}

