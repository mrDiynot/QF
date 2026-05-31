namespace QualiFlow.Application.Features.Email.DTOs;

/// <summary>
/// Resend webhook event payload.
/// </summary>
public class ResendWebhookEvent
{
    /// <summary>
    /// Gets or sets the event type (email.sent, email.delivered, email.opened, email.clicked, email.bounced).
    /// </summary>
    public required string Type { get; set; }

    /// <summary>
    /// Gets or sets the Resend email ID.
    /// </summary>
    public required string EmailId { get; set; }

    /// <summary>
    /// Gets or sets when the event occurred.
    /// </summary>
    public required DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets additional event data.
    /// </summary>
#pragma warning disable CA2227 // Collection properties should be read only - DTOs need setters for deserialization
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - Dictionary required for JSON serialization
    public Dictionary<string, object>? Data { get; set; }
#pragma warning restore MA0016
#pragma warning restore CA2227
}

