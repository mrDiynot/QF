// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.ScoringCriteria.DTOs;

/// <summary>
/// Response DTO for scoring criteria.
/// </summary>
public record ScoringCriteriaResponse
{
    /// <summary>Gets the unique identifier.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the criterion name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the criterion description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the weight (0-100).</summary>
    public int Weight { get; init; }

    /// <summary>Gets the AI extraction hint.</summary>
    public string? ExtractionHint { get; init; }

    /// <summary>Gets a value indicating whether this criterion is active.</summary>
    public bool IsActive { get; init; }

    /// <summary>Gets the display order.</summary>
    public int DisplayOrder { get; init; }

    /// <summary>Gets the minimum score threshold.</summary>
    public int MinimumScore { get; init; }

    /// <summary>Gets the category.</summary>
    public string Category { get; init; } = "Custom";

    /// <summary>Gets the AI question prompts.</summary>
    public string? AiQuestions { get; init; }

    /// <summary>Gets the creation timestamp.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets the last update timestamp.</summary>
    public DateTime? UpdatedAt { get; init; }
}

