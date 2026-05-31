namespace QualiFlow.Application.Features.Webhooks.DTOs;

/// <summary>
/// Request DTO for creating a webhook.
/// </summary>
public class CreateWebhookRequest
{
    /// <summary>
    /// Gets or sets the webhook URL (must be HTTPS in production).
    /// </summary>
#pragma warning disable CA1056 // URI properties should not be strings - DTOs use strings for JSON serialization
    public string Url { get; set; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the event types to subscribe to.
    /// Examples: "lead.created", "lead.qualified", "conversation.message_received".
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
    public ICollection<string> Events { get; set; } = [];
#pragma warning restore CA2227

    /// <summary>
    /// Gets or sets the optional description.
    /// </summary>
    public string? Description { get; set; }
}

