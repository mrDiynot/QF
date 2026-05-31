namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Response from sentiment analysis of a single message.
/// </summary>
public sealed record SentimentAnalysisResponse
{
    /// <summary>
    /// Gets the overall sentiment label (Positive, Negative, Neutral, Mixed).
    /// </summary>
    public required string Sentiment { get; init; }

    /// <summary>
    /// Gets the sentiment score from -1.0 (very negative) to 1.0 (very positive).
    /// </summary>
    public required double Score { get; init; }

    /// <summary>
    /// Gets the confidence level of the sentiment classification (0.0 to 1.0).
    /// </summary>
    public required double Confidence { get; init; }

    /// <summary>
    /// Gets the polarity breakdown (positive, negative, neutral percentages).
    /// </summary>
    public required SentimentPolarityDto Polarity { get; init; }

    /// <summary>
    /// Gets the list of detected emotions with their intensity scores.
    /// </summary>
    public required IReadOnlyList<EmotionDto> Emotions { get; init; }

    /// <summary>
    /// Gets the frustration indicators and escalation detection.
    /// </summary>
    public required FrustrationIndicatorsDto FrustrationIndicators { get; init; }

    /// <summary>
    /// Gets a value indicating whether this message requires human escalation.
    /// </summary>
    public required bool RequiresEscalation { get; init; }

    /// <summary>
    /// Gets the reason for escalation if RequiresEscalation is true.
    /// </summary>
    public string? EscalationReason { get; init; }

    /// <summary>
    /// Gets the urgency level based on sentiment (low, medium, high, critical).
    /// </summary>
    public required string UrgencyLevel { get; init; }

    /// <summary>
    /// Gets the brief reasoning for the sentiment classification.
    /// </summary>
    public string? Reasoning { get; init; }
}

