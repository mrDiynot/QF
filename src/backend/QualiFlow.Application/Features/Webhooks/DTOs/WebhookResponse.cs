using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Webhooks.DTOs;

/// <summary>
/// Response DTO for webhook.
/// </summary>
public class WebhookResponse
{
    /// <summary>
    /// Gets or sets the webhook ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the webhook URL.
    /// </summary>
#pragma warning disable CA1056 // URI properties should not be strings - DTOs use strings for JSON serialization
    public string Url { get; set; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the subscribed event types.
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
    public ICollection<string> Events { get; set; } = [];
#pragma warning restore CA2227

    /// <summary>
    /// Gets or sets the webhook status.
    /// </summary>
    public WebhookStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the consecutive failures count.
    /// </summary>
    public int ConsecutiveFailures { get; set; }

    /// <summary>
    /// Gets or sets the last success timestamp.
    /// </summary>
    public DateTime? LastSuccessAt { get; set; }

    /// <summary>
    /// Gets or sets the last failure timestamp.
    /// </summary>
    public DateTime? LastFailureAt { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the update timestamp.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}

