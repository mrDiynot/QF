namespace QualiFlow.Application.Features.RealTime.DTOs;

/// <summary>
/// Event DTO for broadcasting read receipts in real-time.
/// </summary>
public class ReadReceiptEvent
{
    private readonly List<Guid> _messageIds = [];

    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets the list of message IDs that were marked as read.
    /// </summary>
    public IReadOnlyList<Guid> MessageIds => _messageIds.AsReadOnly();

    /// <summary>
    /// Gets or sets the user ID who read the messages.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user email who read the messages.
    /// </summary>
    public string? UserEmail { get; set; }

    /// <summary>
    /// Gets or sets when the messages were read.
    /// </summary>
    public DateTime ReadAt { get; set; }

    /// <summary>
    /// Adds message IDs to the read receipt.
    /// </summary>
    /// <param name="messageIds">The message IDs to add.</param>
    public void AddMessageIds(IEnumerable<Guid> messageIds)
    {
        _messageIds.AddRange(messageIds);
    }
}

