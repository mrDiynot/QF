namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Indicators of customer frustration and escalation triggers.
/// </summary>
public sealed record FrustrationIndicatorsDto
{
    /// <summary>
    /// Gets the overall frustration level (0.0 to 1.0).
    /// </summary>
    public required double FrustrationLevel { get; init; }

    /// <summary>
    /// Gets a value indicating whether high frustration was detected (level >= 0.7).
    /// </summary>
    public required bool IsHighFrustration { get; init; }

    /// <summary>
    /// Gets the list of detected frustration triggers.
    /// </summary>
    public required IReadOnlyList<string> Triggers { get; init; }

    /// <summary>
    /// Gets a value indicating whether customer explicitly requested escalation.
    /// </summary>
    public required bool ExplicitEscalationRequest { get; init; }

    /// <summary>
    /// Gets the number of repeated complaints detected.
    /// </summary>
    public required int RepeatedComplaintCount { get; init; }

    /// <summary>
    /// Gets the keywords or phrases indicating frustration.
    /// </summary>
    public required IReadOnlyList<string> FrustrationKeywords { get; init; }
}

