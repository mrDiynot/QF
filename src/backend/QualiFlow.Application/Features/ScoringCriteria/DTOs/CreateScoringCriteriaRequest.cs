// -----------------------------------------------------------------------
// <copyright file="CreateScoringCriteriaRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.ScoringCriteria.DTOs;

/// <summary>
/// Request DTO for creating a new scoring criterion.
/// </summary>
public record CreateScoringCriteriaRequest
{
    /// <summary>Gets the criterion name (required, max 100 chars).</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the criterion description (optional, max 500 chars).</summary>
    public string? Description { get; init; }

    /// <summary>Gets the weight (required, 0-100).</summary>
    public int Weight { get; init; }

    /// <summary>Gets the AI extraction hint (optional, max 500 chars).</summary>
    public string? ExtractionHint { get; init; }

    /// <summary>Gets a value indicating whether this criterion is active (default: true).</summary>
    public bool IsActive { get; init; } = true;

    /// <summary>Gets the display order (default: 0).</summary>
    public int DisplayOrder { get; init; }

    /// <summary>Gets the minimum score threshold (0-100, default: 0).</summary>
    public int MinimumScore { get; init; }

    /// <summary>Gets the category (default: "Custom").</summary>
    public string Category { get; init; } = "Custom";

    /// <summary>Gets the AI question prompts (optional, max 2000 chars).</summary>
    public string? AiQuestions { get; init; }
}

