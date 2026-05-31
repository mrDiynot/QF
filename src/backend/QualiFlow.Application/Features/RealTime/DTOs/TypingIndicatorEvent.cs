namespace QualiFlow.Application.Features.RealTime.DTOs;

/// <summary>
/// Event DTO for broadcasting typing indicators in real-time.
/// </summary>
public class TypingIndicatorEvent
{
    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the user email who is typing.
    /// </summary>
    public string? UserEmail { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is currently typing.
    /// </summary>
    public bool IsTyping { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the typing indicator.
    /// </summary>
    public DateTime Timestamp { get; set; }
}

