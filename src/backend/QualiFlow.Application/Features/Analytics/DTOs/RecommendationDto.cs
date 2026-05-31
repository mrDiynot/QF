namespace QualiFlow.Application.Features.Analytics.DTOs;

/// <summary>
/// Type of recommendation.
/// </summary>
public enum RecommendationType
{
    /// <summary>
    /// Optimization recommendation to improve performance.
    /// </summary>
    Optimization,

    /// <summary>
    /// Setup recommendation to complete channel configuration.
    /// </summary>
    Setup,

    /// <summary>
    /// Maintenance recommendation for ongoing channel health.
    /// </summary>
    Maintenance,

    /// <summary>
    /// Upgrade recommendation to unlock new features.
    /// </summary>
    Upgrade
}

/// <summary>
/// Priority level for recommendations.
/// </summary>
public enum RecommendationPriority
{
    /// <summary>
    /// Low priority - minor improvement opportunity.
    /// </summary>
    Low,

    /// <summary>
    /// Medium priority - should be addressed soon.
    /// </summary>
    Medium,

    /// <summary>
    /// High priority - requires immediate attention.
    /// </summary>
    High
}

/// <summary>
/// AI-powered recommendation to improve channel performance.
/// </summary>
public record RecommendationDto
{
    /// <summary>
    /// Gets the recommendation ID.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the recommendation type.
    /// </summary>
    public RecommendationType Type { get; init; }

    /// <summary>
    /// Gets the priority level.
    /// </summary>
    public RecommendationPriority Priority { get; init; }

    /// <summary>
    /// Gets the recommendation title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the detailed description.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Gets the suggested action (optional).
    /// </summary>
    public string? Action { get; init; }

    /// <summary>
    /// Gets the expected impact of implementing this recommendation.
    /// </summary>
    public string Impact { get; init; } = string.Empty;
}
