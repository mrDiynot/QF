using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Request payload to move a deal to a different stage.
/// </summary>
public sealed record MoveDealRequest
{
    /// <summary>
    /// Gets the new pipeline stage to move the deal to.
    /// </summary>
    public required DealStage NewStage { get; init; }

    /// <summary>
    /// Gets the loss reason (required when moving to Lost stage).
    /// </summary>
    public string? LossReason { get; init; }
}
