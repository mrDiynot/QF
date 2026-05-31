namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the direction of a message.
/// </summary>
public enum MessageDirection
{
    /// <summary>
    /// Message received from the lead.
    /// </summary>
    Inbound = 0,

    /// <summary>
    /// Message sent to the lead.
    /// </summary>
    Outbound = 1,
}

