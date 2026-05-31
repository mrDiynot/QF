using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Webhooks.DTOs;

/// <summary>
/// Response DTO for webhook delivery.
/// </summary>
public class WebhookDeliveryResponse
{
    /// <summary>
    /// Gets or sets the delivery ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the webhook ID.
    /// </summary>
    public Guid WebhookId { get; set; }

    /// <summary>
    /// Gets or sets the event type.
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the delivery status.
    /// </summary>
    public WebhookDeliveryStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the number of delivery attempts.
    /// </summary>
    public int Attempts { get; set; }

    /// <summary>
    /// Gets or sets the next retry timestamp.
    /// </summary>
    public DateTime? NextRetryAt { get; set; }

    /// <summary>
    /// Gets or sets the HTTP response code.
    /// </summary>
    public int? ResponseCode { get; set; }

    /// <summary>
    /// Gets or sets the error message.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the request duration in milliseconds.
    /// </summary>
    public int? DurationMs { get; set; }

    /// <summary>
    /// Gets or sets the completion timestamp.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

