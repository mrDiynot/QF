namespace QualiFlow.API.Controllers;

/// <summary>
/// Pipeline analytics response containing key sales metrics.
/// </summary>
public sealed record PipelineAnalytics
{
    /// <summary>
    /// Gets the total value of all open deals in the pipeline.
    /// </summary>
    public required decimal TotalPipelineValue { get; init; }

    /// <summary>
    /// Gets the weighted pipeline value (total value * probability).
    /// </summary>
    public required decimal WeightedPipelineValue { get; init; }

    /// <summary>
    /// Gets the win rate percentage (won deals / total closed deals).
    /// </summary>
    public required decimal WinRate { get; init; }
}
