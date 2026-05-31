namespace QualiFlow.Application.Features.Meta.Interfaces;

/// <summary>
/// Media types supported by Meta messaging.
/// </summary>
public enum MetaMediaType
{
    /// <summary>Image attachment (jpg, png, gif).</summary>
    Image,

    /// <summary>Video attachment (mp4).</summary>
    Video,

    /// <summary>Audio attachment (mp3).</summary>
    Audio,

    /// <summary>File attachment (pdf, doc, etc.).</summary>
    File,
}

/// <summary>
/// Service for sending messages via Meta platforms (Facebook Messenger, Instagram).
/// </summary>
public interface IMetaMessagingService
{
    /// <summary>
    /// Sends a text message to a recipient.
    /// </summary>
    /// <param name="pageId">The Page ID to send from.</param>
    /// <param name="recipientId">The recipient's PSID (Facebook) or IGSID (Instagram).</param>
    /// <param name="text">The message text.</param>
    /// <param name="messagingType">The messaging type (RESPONSE, UPDATE, MESSAGE_TAG).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the send operation.</returns>
    Task<MetaSendMessageResult> SendTextMessageAsync(
        string pageId,
        string recipientId,
        string text,
        MetaMessagingType messagingType = MetaMessagingType.Response,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a message with quick reply buttons.
    /// </summary>
    /// <param name="pageId">The Page ID to send from.</param>
    /// <param name="recipientId">The recipient's PSID or IGSID.</param>
    /// <param name="text">The message text.</param>
    /// <param name="quickReplies">The quick reply options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the send operation.</returns>
    Task<MetaSendMessageResult> SendQuickReplyMessageAsync(
        string pageId,
        string recipientId,
        string text,
        IEnumerable<MetaQuickReply> quickReplies,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a typing indicator to show the user we're processing.
    /// </summary>
    /// <param name="pageId">The Page ID.</param>
    /// <param name="recipientId">The recipient's PSID or IGSID.</param>
    /// <param name="isTyping">True to show typing, false to hide.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the indicator was sent successfully.</returns>
    Task<bool> SendTypingIndicatorAsync(
        string pageId,
        string recipientId,
        bool isTyping,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a message as seen.
    /// </summary>
    /// <param name="pageId">The Page ID.</param>
    /// <param name="recipientId">The recipient's PSID or IGSID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the message was marked as seen.</returns>
    Task<bool> MarkAsSeenAsync(
        string pageId,
        string recipientId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of sending a message via Meta.
/// </summary>
public record MetaSendMessageResult
{
    /// <summary>
    /// Gets a value indicating whether the message was sent successfully.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the message ID assigned by Meta.
    /// </summary>
    public string? MessageId { get; init; }

    /// <summary>
    /// Gets the recipient ID.
    /// </summary>
    public string? RecipientId { get; init; }

    /// <summary>
    /// Gets the error message if the send failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Gets the Meta error code if the send failed.
    /// </summary>
    public int? ErrorCode { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <returns>A successful send message result.</returns>
    public static MetaSendMessageResult SuccessResult(string messageId, string recipientId) =>
        new() { Success = true, MessageId = messageId, RecipientId = recipientId };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    /// <returns>A failed send message result.</returns>
    public static MetaSendMessageResult FailureResult(string errorMessage, int? errorCode = null) =>
        new() { Success = false, ErrorMessage = errorMessage, ErrorCode = errorCode };
}

/// <summary>
/// Quick reply button for Meta messages.
/// </summary>
public record MetaQuickReply
{
    /// <summary>
    /// Gets the content type (usually "text").
    /// </summary>
    public string ContentType { get; init; } = "text";

    /// <summary>
    /// Gets the button title (max 20 characters).
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the payload sent back when button is clicked.
    /// </summary>
    public string Payload { get; init; } = string.Empty;
}

