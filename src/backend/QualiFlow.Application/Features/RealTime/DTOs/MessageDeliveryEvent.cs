namespace QualiFlow.Application.Features.RealTime.DTOs;

/// <summary>
/// Event DTO for broadcasting message delivery acknowledgments.
/// </summary>
public class MessageDeliveryEvent
{
    /// <summary>
    /// Gets or sets the message ID.
    /// </summary>
    public Guid MessageId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the delivery status (Sent, Delivered, Failed).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timestamp of the delivery event.
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the error message if delivery failed.
    /// </summary>
    public string? ErrorMessage { get; set; }
}

