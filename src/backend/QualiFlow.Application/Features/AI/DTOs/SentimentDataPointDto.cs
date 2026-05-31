namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// A single data point in sentiment trend analysis.
/// </summary>
public sealed record SentimentDataPointDto
{
    /// <summary>
    /// Gets the message index (0-based).
    /// </summary>
    public required int Index { get; init; }

    /// <summary>
    /// Gets the sentiment score at this point.
    /// </summary>
    public required double Score { get; init; }

    /// <summary>
    /// Gets the sentiment label at this point.
    /// </summary>
    public required string Sentiment { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is a customer message.
    /// </summary>
    public required bool IsCustomerMessage { get; init; }

    /// <summary>
    /// Gets the optional timestamp of the message.
    /// </summary>
    public DateTime? Timestamp { get; init; }
}

