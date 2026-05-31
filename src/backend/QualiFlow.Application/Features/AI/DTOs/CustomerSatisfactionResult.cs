namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Customer satisfaction indicators derived from sentiment analysis.
/// </summary>
public sealed record CustomerSatisfactionResult
{
    /// <summary>
    /// Gets the CSAT proxy score (1-5 scale).
    /// </summary>
    public required double CsatScore { get; init; }

    /// <summary>
    /// Gets the NPS proxy score (-100 to +100).
    /// </summary>
    public required double NpsScore { get; init; }

    /// <summary>
    /// Gets the Customer Effort Score proxy (1-7 scale, lower is better).
    /// </summary>
    public required double EffortScore { get; init; }

    /// <summary>
    /// Gets the confidence in the satisfaction assessment.
    /// </summary>
    public required double Confidence { get; init; }

    /// <summary>
    /// Gets the factors contributing to satisfaction.
    /// </summary>
    public required IReadOnlyList<string> SatisfactionDrivers { get; init; }

    /// <summary>
    /// Gets the factors contributing to dissatisfaction.
    /// </summary>
    public required IReadOnlyList<string> DissatisfactionDrivers { get; init; }

    /// <summary>
    /// Gets the overall satisfaction category (satisfied, neutral, dissatisfied).
    /// </summary>
    public required string OverallCategory { get; init; }

    /// <summary>
    /// Gets the recommended follow-up action based on satisfaction level.
    /// </summary>
    public string? RecommendedAction { get; init; }
}

