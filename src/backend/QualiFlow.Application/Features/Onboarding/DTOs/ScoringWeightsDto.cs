namespace QualiFlow.Application.Features.Onboarding.DTOs;

/// <summary>
/// DTO for AI scoring weights.
/// </summary>
public record ScoringWeightsDto
{
    /// <summary>
    /// Gets or sets the budget weight (0-100).
    /// </summary>
    public int Budget { get; set; } = 25;

    /// <summary>
    /// Gets or sets the timeline weight (0-100).
    /// </summary>
    public int Timeline { get; set; } = 25;

    /// <summary>
    /// Gets or sets the authority weight (0-100).
    /// </summary>
    public int Authority { get; set; } = 25;

    /// <summary>
    /// Gets or sets the need weight (0-100).
    /// </summary>
    public int Need { get; set; } = 25;
}
