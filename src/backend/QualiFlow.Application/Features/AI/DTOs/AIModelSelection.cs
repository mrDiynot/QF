// -----------------------------------------------------------------------
// <copyright file="AIModelSelection.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of AI model selection with cost estimation.
/// </summary>
public sealed record AIModelSelection
{
    /// <summary>Gets the selected model name.</summary>
    public required string Model { get; init; }

    /// <summary>Gets the maximum tokens for the task.</summary>
    public required int MaxTokens { get; init; }

    /// <summary>Gets the temperature setting.</summary>
    public required float Temperature { get; init; }

    /// <summary>Gets the estimated cost per 1K tokens (input).</summary>
    public required decimal EstimatedInputCostPer1K { get; init; }

    /// <summary>Gets the estimated cost per 1K tokens (output).</summary>
    public required decimal EstimatedOutputCostPer1K { get; init; }
}
