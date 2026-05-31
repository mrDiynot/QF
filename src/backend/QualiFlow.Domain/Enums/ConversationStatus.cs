namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a conversation.
/// </summary>
public enum ConversationStatus
{
    /// <summary>
    /// Conversation is open and awaiting response.
    /// </summary>
    Open = 0,

    /// <summary>
    /// Conversation is actively in progress.
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// Conversation has been closed.
    /// </summary>
    Closed = 2,

    /// <summary>
    /// Conversation has been archived.
    /// </summary>
    Archived = 3,
}

