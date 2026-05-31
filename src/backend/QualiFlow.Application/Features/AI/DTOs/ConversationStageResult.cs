// -----------------------------------------------------------------------
// <copyright file="ConversationStageResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Result of conversation stage classification.
/// </summary>
public sealed record ConversationStageResult
{
    /// <summary>Gets the current conversation stage.</summary>
    public required string Stage { get; init; }

    /// <summary>Gets the confidence score (0-1).</summary>
    public required float Confidence { get; init; }

    /// <summary>Gets the stage description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the next expected stage.</summary>
    public string? NextExpectedStage { get; init; }

    /// <summary>Gets recommended actions for this stage.</summary>
    public IReadOnlyList<string>? RecommendedActions { get; init; }

    /// <summary>Gets the estimated progress percentage (0-100).</summary>
    public int ProgressPercentage { get; init; }
}

