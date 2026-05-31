// -----------------------------------------------------------------------
// <copyright file="BantExtractionResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// BANT (Budget, Authority, Need, Timeline) extraction result.
/// </summary>
public sealed record BantExtractionResult
{
    /// <summary>Gets the budget score (0-100).</summary>
    public int BudgetScore { get; init; }

    /// <summary>Gets the budget details.</summary>
    public BudgetInfoDto? Budget { get; init; }

    /// <summary>Gets the authority score (0-100).</summary>
    public int AuthorityScore { get; init; }

    /// <summary>Gets the authority details.</summary>
    public AuthorityInfoDto? Authority { get; init; }

    /// <summary>Gets the need score (0-100).</summary>
    public int NeedScore { get; init; }

    /// <summary>Gets the need details.</summary>
    public NeedInfoDto? Need { get; init; }

    /// <summary>Gets the timeline score (0-100).</summary>
    public int TimelineScore { get; init; }

    /// <summary>Gets the timeline details.</summary>
    public TimelineInfoDto? Timeline { get; init; }

    /// <summary>Gets the overall BANT completeness percentage (0-100).</summary>
    public int CompletenessPercentage { get; init; }

    /// <summary>Gets the list of missing BANT components.</summary>
    public IReadOnlyList<string> MissingComponents { get; init; } = [];

    /// <summary>Gets the overall confidence score (0-1).</summary>
    public double Confidence { get; init; }

    /// <summary>Gets the qualification recommendation.</summary>
    public string? Recommendation { get; init; }
}

