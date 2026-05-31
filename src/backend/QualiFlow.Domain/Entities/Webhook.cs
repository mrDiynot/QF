using System.Diagnostics.CodeAnalysis;

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a webhook subscription for receiving real-time event notifications.
/// Webhooks allow external systems to be notified when specific events occur in QualiFlow.
/// </summary>
public class Webhook : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID that owns this webhook.
    /// REQUIRED for multi-tenancy - all queries MUST filter by this.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the webhook destination URL.
    /// Must be HTTPS in production for security.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI properties should not be strings", Justification = "URL is stored as string in database for simplicity")]
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets the list of event types this webhook subscribes to.
    /// Examples: "lead.created", "lead.qualified", "conversation.message_received".
    /// </summary>
    public ICollection<string> Events { get; init; } = [];

    /// <summary>
    /// Gets or sets the webhook secret used for HMAC signature verification.
    /// Generated automatically when webhook is created.
    /// </summary>
    public string Secret { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the webhook status.
    /// </summary>
    public WebhookStatus Status { get; set; } = WebhookStatus.Active;

    /// <summary>
    /// Gets or sets the webhook description (optional).
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the number of consecutive failures.
    /// Webhook is automatically disabled after 10 consecutive failures.
    /// </summary>
    public int ConsecutiveFailures { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last successful delivery.
    /// </summary>
    public DateTime? LastSuccessAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last failed delivery.
    /// </summary>
    public DateTime? LastFailureAt { get; set; }

    /// <summary>
    /// Gets or sets the business that owns this webhook.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the collection of webhook deliveries.
    /// </summary>
    public ICollection<WebhookDelivery> Deliveries { get; init; } = [];
}

