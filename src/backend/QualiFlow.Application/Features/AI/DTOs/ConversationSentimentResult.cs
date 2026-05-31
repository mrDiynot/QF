namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Sentiment analysis result for an entire conversation.
/// </summary>
public sealed record ConversationSentimentResult
{
    /// <summary>
    /// Gets the overall sentiment of the conversation.
    /// </summary>
    public required string OverallSentiment { get; init; }

    /// <summary>
    /// Gets the average sentiment score across all messages.
    /// </summary>
    public required double AverageScore { get; init; }

    /// <summary>
    /// Gets the confidence in the overall sentiment classification.
    /// </summary>
    public required double Confidence { get; init; }

    /// <summary>
    /// Gets the per-message sentiment breakdown.
    /// </summary>
    public required IReadOnlyList<MessageSentimentDto> MessageSentiments { get; init; }

    /// <summary>
    /// Gets the dominant emotions across the conversation.
    /// </summary>
    public required IReadOnlyList<EmotionDto> DominantEmotions { get; init; }

    /// <summary>
    /// Gets the total number of messages analyzed.
    /// </summary>
    public required int MessageCount { get; init; }

    /// <summary>
    /// Gets the number of positive messages.
    /// </summary>
    public required int PositiveMessageCount { get; init; }

    /// <summary>
    /// Gets the number of negative messages.
    /// </summary>
    public required int NegativeMessageCount { get; init; }

    /// <summary>
    /// Gets the number of neutral messages.
    /// </summary>
    public required int NeutralMessageCount { get; init; }

    /// <summary>
    /// Gets a value indicating whether the conversation requires escalation.
    /// </summary>
    public required bool RequiresEscalation { get; init; }

    /// <summary>
    /// Gets the escalation reasons if applicable.
    /// </summary>
    public IReadOnlyList<string>? EscalationReasons { get; init; }
}

