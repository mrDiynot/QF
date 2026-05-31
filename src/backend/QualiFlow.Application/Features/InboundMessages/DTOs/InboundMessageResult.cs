namespace QualiFlow.Application.Features.InboundMessages.DTOs;

/// <summary>
/// Represents the result of processing an inbound message.
/// </summary>
public record InboundMessageResult
{
    private const string EmptyTwiml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>";

    /// <summary>
    /// Gets a value indicating whether the processing was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the ID of the lead (created or matched).
    /// </summary>
    public Guid? LeadId { get; init; }

    /// <summary>
    /// Gets the ID of the conversation.
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Gets the ID of the stored message.
    /// </summary>
    public Guid? MessageId { get; init; }

    /// <summary>
    /// Gets the TwiML response to return to Twilio.
    /// </summary>
    public string? TwimlResponse { get; init; }

    /// <summary>
    /// Gets the error message if processing failed.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Gets a value indicating whether a new lead was created.
    /// </summary>
    public bool IsNewLead { get; init; }

    /// <summary>
    /// Gets a value indicating whether a new conversation was created.
    /// </summary>
    public bool IsNewConversation { get; init; }

    /// <summary>
    /// Creates a successful result.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="messageId">The message ID.</param>
    /// <param name="isNewLead">Whether a new lead was created.</param>
    /// <param name="isNewConversation">Whether a new conversation was created.</param>
    /// <param name="twimlResponse">The TwiML response.</param>
    /// <returns>A successful result.</returns>
    public static InboundMessageResult SuccessResult(
        Guid leadId,
        Guid conversationId,
        Guid messageId,
        bool isNewLead = false,
        bool isNewConversation = false,
        string? twimlResponse = null) => new()
        {
            Success = true,
            LeadId = leadId,
            ConversationId = conversationId,
            MessageId = messageId,
            IsNewLead = isNewLead,
            IsNewConversation = isNewConversation,
            TwimlResponse = twimlResponse ?? EmptyTwiml,
        };

    /// <summary>
    /// Creates a failure result.
    /// </summary>
    /// <param name="errorMessage">The error message.</param>
    /// <returns>A failure result.</returns>
    public static InboundMessageResult FailureResult(string errorMessage) => new()
    {
        Success = false,
        ErrorMessage = errorMessage,
        TwimlResponse = EmptyTwiml,
    };

    /// <summary>
    /// Generates a TwiML response with an auto-reply message.
    /// </summary>
    /// <param name="message">The message to include in the reply.</param>
    /// <returns>A TwiML response string.</returns>
    public static string GenerateSmsReplyTwiml(string message) =>
        $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>{System.Security.SecurityElement.Escape(message)}</Message></Response>";

    /// <summary>
    /// Generates a TwiML response for voice call with recording.
    /// </summary>
    /// <param name="recordingCallbackUri">The URI for the recording callback.</param>
    /// <returns>A TwiML response string.</returns>
#pragma warning disable CA1054 // URI-like properties should not be strings
    public static string GenerateVoiceRecordTwiml(string recordingCallbackUri) =>
#pragma warning restore CA1054
        $"<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
        $"<Response>" +
        $"<Say>Thank you for calling. Your call will be recorded for quality purposes.</Say>" +
        $"<Record maxLength=\"300\" transcribe=\"false\" recordingStatusCallback=\"{System.Security.SecurityElement.Escape(recordingCallbackUri)}\" />" +
        $"</Response>";
}

