namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Unified input for AI qualification across all channels.
/// This normalizes data from messages, forms, and voice transcripts.
/// </summary>
public record QualificationInput
{
    /// <summary>
    /// Gets the business ID for multi-tenancy.
    /// </summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the lead ID being qualified.
    /// </summary>
    public required Guid LeadId { get; init; }

    /// <summary>
    /// Gets the source channel (SMS, WhatsApp, Voice, Chat, Form, QRCode).
    /// </summary>
    public required string Channel { get; init; }

    /// <summary>
    /// Gets the trigger ID (message ID, form submission ID, etc.).
    /// </summary>
    public Guid? TriggerId { get; init; }

    /// <summary>
    /// Gets conversation ID if applicable.
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Gets text content to analyze (message text, form data summary, transcript).
    /// </summary>
    public string TextContent { get; init; } = string.Empty;

    /// <summary>
    /// Gets structured data extracted from the source (form fields, entities, etc.).
    /// </summary>
    public IReadOnlyDictionary<string, string> StructuredData { get; init; } = new Dictionary<string, string>();

    /// <summary>
    /// Gets pre-extracted BANT signals from rule-based analysis.
    /// </summary>
    public IReadOnlyList<FormFieldBantExtraction>? PreExtractedBantSignals { get; init; }

    /// <summary>
    /// Gets conversation history for context (if available).
    /// </summary>
    public IReadOnlyList<ConversationMessageContext>? ConversationHistory { get; init; }

    /// <summary>
    /// Gets a value indicating whether whether to use AI for additional analysis.
    /// </summary>
    public bool UseAIAnalysis { get; init; } = true;

    /// <summary>
    /// Gets metadata about the input source.
    /// </summary>
    public QualificationInputMetadata? Metadata { get; init; }
}

/// <summary>
/// Context for a conversation message in qualification.
/// </summary>
public record ConversationMessageContext
{
    /// <summary>
    /// Gets the message content.
    /// </summary>
    public required string Content { get; init; }

    /// <summary>
    /// Gets a value indicating whether whether the message is from the lead (true) or agent/AI (false).
    /// </summary>
    public bool IsFromLead { get; init; }

    /// <summary>
    /// Gets when the message was sent.
    /// </summary>
    public DateTime Timestamp { get; init; }

    /// <summary>
    /// Gets the message sender role (Lead, Agent, AI).
    /// </summary>
    public string SenderRole { get; init; } = "Lead";
}

/// <summary>
/// Metadata about the qualification input source.
/// </summary>
public record QualificationInputMetadata
{
    /// <summary>
    /// Gets form ID if source is a form submission.
    /// </summary>
    public Guid? FormId { get; init; }

    /// <summary>
    /// Gets form name if source is a form submission.
    /// </summary>
    public string? FormName { get; init; }

    /// <summary>
    /// Gets the QR code ID if source is a QR code scan.
    /// </summary>
    public Guid? QrCodeId { get; init; }

    /// <summary>
    /// Gets voice session ID if source is a voice call.
    /// </summary>
    public Guid? VoiceSessionId { get; init; }

    /// <summary>
    /// Gets call duration in seconds if source is a voice call.
    /// </summary>
    public int? CallDurationSeconds { get; init; }

    /// <summary>
    /// Gets the IP address of the submitter.
    /// </summary>
    public string? IpAddress { get; init; }

    /// <summary>
    /// Gets user agent of the submitter.
    /// </summary>
    public string? UserAgent { get; init; }

    /// <summary>
    /// Gets the referrer URL if available.
    /// </summary>
    public Uri? ReferrerUrl { get; init; }
}

