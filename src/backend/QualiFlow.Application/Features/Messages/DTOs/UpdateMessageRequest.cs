namespace QualiFlow.Application.Features.Messages.DTOs;

/// <summary>
/// Request DTO for updating an existing message.
/// All properties are optional for partial updates.
/// </summary>
public class UpdateMessageRequest
{
    /// <summary>
    /// Gets or sets the updated message content.
    /// </summary>
    /// <example>Updated message content.</example>
    public string? Content { get; set; }

    /// <summary>
    /// Gets or sets when the message was delivered.
    /// </summary>
    /// <example>2025-12-03T15:30:00Z.</example>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Gets or sets when the message was read.
    /// </summary>
    /// <example>2025-12-03T15:35:00Z.</example>
    public DateTime? ReadAt { get; set; }
}

