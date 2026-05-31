namespace QualiFlow.Application.Features.Meta.Interfaces;

/// <summary>
/// Meta messaging types for the messaging_type parameter.
/// </summary>
public enum MetaMessagingType
{
    /// <summary>
    /// Response to a user-initiated message (within 24-hour window).
    /// </summary>
    Response,

    /// <summary>
    /// Proactive message using a message tag.
    /// </summary>
    MessageTag,

    /// <summary>
    /// Update message (deprecated, use MessageTag instead).
    /// </summary>
    Update
}

