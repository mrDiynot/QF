namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Sentiment analysis for a single message within a conversation.
/// </summary>
public sealed record MessageSentimentDto
{
    /// <summary>
    /// Gets the index of the message in the conversation (0-based).
    /// </summary>
    public required int MessageIndex { get; init; }

    /// <summary>
    /// Gets the sentiment label for this message.
    /// </summary>
    public required string Sentiment { get; init; }

    /// <summary>
    /// Gets the sentiment score (-1.0 to 1.0).
    /// </summary>
    public required double Score { get; init; }

    /// <summary>
    /// Gets the primary emotion detected in this message.
    /// </summary>
    public string? PrimaryEmotion { get; init; }

    /// <summary>
    /// Gets a value indicating whether this message is from the customer (true) or agent/bot (false).
    /// </summary>
    public required bool IsCustomerMessage { get; init; }
}

