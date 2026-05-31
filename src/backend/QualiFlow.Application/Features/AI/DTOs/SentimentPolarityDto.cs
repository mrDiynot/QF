namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Breakdown of sentiment polarity percentages.
/// </summary>
public sealed record SentimentPolarityDto
{
    /// <summary>
    /// Gets the percentage of positive sentiment (0.0 to 1.0).
    /// </summary>
    public required double Positive { get; init; }

    /// <summary>
    /// Gets the percentage of negative sentiment (0.0 to 1.0).
    /// </summary>
    public required double Negative { get; init; }

    /// <summary>
    /// Gets the percentage of neutral sentiment (0.0 to 1.0).
    /// </summary>
    public required double Neutral { get; init; }
}

