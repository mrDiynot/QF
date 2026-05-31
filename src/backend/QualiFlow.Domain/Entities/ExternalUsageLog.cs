using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a log entry for external service usage (OpenAI, Twilio).
/// Used for tracking and billing purposes.
/// </summary>
public class ExternalUsageLog : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the type of external service.
    /// Values: "openai", "twilio_sms", "twilio_voice", "twilio_whatsapp".
    /// </summary>
    public required string ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the type of operation performed.
    /// For OpenAI: "qualification", "intent_detection", "sentiment_analysis", "response_generation", "completion".
    /// For Twilio: "inbound", "outbound".
    /// </summary>
    public required string OperationType { get; set; }

    /// <summary>
    /// Gets or sets the number of input tokens (for OpenAI).
    /// </summary>
    public int? InputTokens { get; set; }

    /// <summary>
    /// Gets or sets the number of output tokens (for OpenAI).
    /// </summary>
    public int? OutputTokens { get; set; }

    /// <summary>
    /// Gets or sets the model used (for OpenAI).
    /// Example: "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo".
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gets or sets the duration in seconds (for Twilio voice calls).
    /// </summary>
    public int? DurationSeconds { get; set; }

    /// <summary>
    /// Gets or sets the direction of the communication (for Twilio).
    /// Values: "inbound", "outbound".
    /// </summary>
    public string? Direction { get; set; }

    /// <summary>
    /// Gets or sets the estimated cost in USD for this usage.
    /// </summary>
    public decimal EstimatedCost { get; set; }

    /// <summary>
    /// Gets or sets the related conversation ID, if applicable.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the related message ID, if applicable.
    /// </summary>
    public Guid? MessageId { get; set; }

    /// <summary>
    /// Gets or sets additional metadata as JSON.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Gets the total tokens used (input + output) for OpenAI.
    /// </summary>
    public int TotalTokens => (InputTokens ?? 0) + (OutputTokens ?? 0);

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this usage log belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the related conversation, if applicable.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the related message, if applicable.
    /// </summary>
    public Message? Message { get; set; }
}
