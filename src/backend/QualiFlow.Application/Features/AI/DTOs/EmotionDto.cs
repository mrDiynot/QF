namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Represents a detected emotion with its intensity.
/// </summary>
public sealed record EmotionDto
{
    /// <summary>
    /// Gets the name of the emotion (e.g., frustration, excitement, anger, satisfaction).
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the intensity of the emotion (0.0 to 1.0).
    /// </summary>
    public required double Intensity { get; init; }

    /// <summary>
    /// Gets the confidence in the emotion detection (0.0 to 1.0).
    /// </summary>
    public required double Confidence { get; init; }
}

