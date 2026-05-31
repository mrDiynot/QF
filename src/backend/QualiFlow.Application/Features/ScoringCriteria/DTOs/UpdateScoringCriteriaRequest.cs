// -----------------------------------------------------------------------
// <copyright file="UpdateScoringCriteriaRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.ScoringCriteria.DTOs;

/// <summary>
/// Request DTO for updating an existing scoring criterion.
/// </summary>
public record UpdateScoringCriteriaRequest
{
    /// <summary>Gets the criterion name (optional, max 100 chars).</summary>
    public string? Name { get; init; }

    /// <summary>Gets the criterion description (optional, max 500 chars).</summary>
    public string? Description { get; init; }

    /// <summary>Gets the weight (optional, 0-100).</summary>
    public int? Weight { get; init; }

    /// <summary>Gets the AI extraction hint (optional, max 500 chars).</summary>
    public string? ExtractionHint { get; init; }

    /// <summary>Gets a value indicating whether this criterion is active.</summary>
    public bool? IsActive { get; init; }

    /// <summary>Gets the display order.</summary>
    public int? DisplayOrder { get; init; }

    /// <summary>Gets the minimum score threshold (0-100).</summary>
    public int? MinimumScore { get; init; }

    /// <summary>Gets the category.</summary>
    public string? Category { get; init; }

    /// <summary>Gets the AI question prompts (optional, max 2000 chars).</summary>
    public string? AiQuestions { get; init; }
}

