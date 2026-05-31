namespace QualiFlow.Application.Features.InboundMessages.DTOs;

/// <summary>
/// Represents a Meta webhook payload (Instagram/Facebook Messenger).
/// </summary>
public record MetaWebhookPayload
{
    /// <summary>
    /// Gets the object type (page, instagram, etc.).
    /// </summary>
    public string ObjectType { get; init; } = string.Empty;

    /// <summary>
    /// Gets the list of webhook entries.
    /// </summary>
    public IReadOnlyList<MetaWebhookEntry> Entry { get; init; } = [];
}

/// <summary>
/// Represents a single entry in the Meta webhook payload.
/// </summary>
public record MetaWebhookEntry
{
    /// <summary>
    /// Gets the page/account ID receiving the message.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the timestamp of the event.
    /// </summary>
    public long Time { get; init; }

    /// <summary>
    /// Gets the messaging events (Facebook Messenger).
    /// </summary>
    public IReadOnlyList<MetaMessagingEvent>? Messaging { get; init; }

    /// <summary>
    /// Gets the changes (Instagram).
    /// </summary>
    public IReadOnlyList<MetaChange>? Changes { get; init; }
}

/// <summary>
/// Represents a Facebook Messenger messaging event.
/// </summary>
public record MetaMessagingEvent
{
    /// <summary>
    /// Gets the sender information.
    /// </summary>
    public MetaParticipant Sender { get; init; } = new();

    /// <summary>
    /// Gets the recipient information.
    /// </summary>
    public MetaParticipant Recipient { get; init; } = new();

    /// <summary>
    /// Gets the timestamp.
    /// </summary>
    public long Timestamp { get; init; }

    /// <summary>
    /// Gets the message content.
    /// </summary>
    public MetaMessage? Message { get; init; }
}

/// <summary>
/// Represents an Instagram change event.
/// </summary>
public record MetaChange
{
    /// <summary>
    /// Gets the field that changed (messages, comments, etc.).
    /// </summary>
    public string Field { get; init; } = string.Empty;

    /// <summary>
    /// Gets the change value.
    /// </summary>
    public MetaChangeValue? Value { get; init; }
}

/// <summary>
/// Represents a participant (sender or recipient).
/// </summary>
public record MetaParticipant
{
    /// <summary>
    /// Gets the participant ID (PSID for Facebook, IGSID for Instagram).
    /// </summary>
    public string Id { get; init; } = string.Empty;
}

/// <summary>
/// Represents a message in the Meta webhook.
/// </summary>
public record MetaMessage
{
    /// <summary>
    /// Gets the unique message ID.
    /// </summary>
    public string Mid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the message text content.
    /// </summary>
    public string? Text { get; init; }

    /// <summary>
    /// Gets any attachments in the message.
    /// </summary>
    public IReadOnlyList<MetaAttachment>? Attachments { get; init; }

    /// <summary>
    /// Gets quick reply payload if applicable.
    /// </summary>
    public MetaQuickReply? QuickReply { get; init; }
}

/// <summary>
/// Represents an attachment in a Meta message.
/// </summary>
public record MetaAttachment
{
    /// <summary>
    /// Gets the attachment type (image, video, audio, file).
    /// </summary>
    public string Type { get; init; } = string.Empty;

    /// <summary>
    /// Gets the attachment payload.
    /// </summary>
    public MetaAttachmentPayload? Payload { get; init; }
}

/// <summary>
/// Represents the payload of an attachment.
/// </summary>
public record MetaAttachmentPayload
{
    /// <summary>
    /// Gets the URL of the attachment.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? Url { get; init; }
#pragma warning restore CA1056
}

/// <summary>
/// Represents a quick reply in a Meta message.
/// </summary>
public record MetaQuickReply
{
    /// <summary>
    /// Gets the quick reply payload.
    /// </summary>
    public string? Payload { get; init; }
}

/// <summary>
/// Represents the value of an Instagram change event.
/// </summary>
public record MetaChangeValue
{
    /// <summary>
    /// Gets the sender ID (IGSID).
    /// </summary>
    public string? From { get; init; }

    /// <summary>
    /// Gets the message content.
    /// </summary>
    public string? Message { get; init; }

    /// <summary>
    /// Gets the media ID if applicable.
    /// </summary>
    public string? MediaId { get; init; }
}

