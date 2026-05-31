namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Sentiment trend analysis over the course of a conversation.
/// </summary>
public sealed record SentimentTrendResult
{
    /// <summary>
    /// Gets the trend trajectory (improving, declining, stable, volatile).
    /// </summary>
    public required string Trajectory { get; init; }

    /// <summary>
    /// Gets the confidence in the trend analysis.
    /// </summary>
    public required double Confidence { get; init; }

    /// <summary>
    /// Gets the starting sentiment score.
    /// </summary>
    public required double StartScore { get; init; }

    /// <summary>
    /// Gets the ending sentiment score.
    /// </summary>
    public required double EndScore { get; init; }

    /// <summary>
    /// Gets the net change in sentiment (EndScore - StartScore).
    /// </summary>
    public required double NetChange { get; init; }

    /// <summary>
    /// Gets the sentiment velocity (rate of change per message).
    /// </summary>
    public required double Velocity { get; init; }

    /// <summary>
    /// Gets the individual data points for trend visualization.
    /// </summary>
    public required IReadOnlyList<SentimentDataPointDto> DataPoints { get; init; }

    /// <summary>
    /// Gets the index of the turning point if trajectory changed significantly.
    /// </summary>
    public int? TurningPointIndex { get; init; }

    /// <summary>
    /// Gets the description of what caused the trajectory change.
    /// </summary>
    public string? TurningPointReason { get; init; }
}

