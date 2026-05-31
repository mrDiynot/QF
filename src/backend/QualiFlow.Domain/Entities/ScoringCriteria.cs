// -----------------------------------------------------------------------
// <copyright file="ScoringCriteria.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents configurable scoring criteria for lead qualification.
/// Each business can define custom criteria with weights and thresholds.
/// </summary>
public class ScoringCriteria : BaseEntity
{
    /// <summary>Gets or sets the business ID (tenant) this criteria belongs to.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the business this criteria belongs to.</summary>
    public Business Business { get; set; } = null!;

    /// <summary>Gets or sets the criterion name (e.g., "Budget", "Authority", "Need", "Timeline").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the criterion description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the weight of this criterion (0-100).</summary>
    public int Weight { get; set; }

    /// <summary>Gets or sets the AI extraction hint for this criterion.</summary>
    public string? ExtractionHint { get; set; }

    /// <summary>Gets or sets a value indicating whether this criterion is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Gets or sets the display order for UI presentation.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the minimum score threshold for this criterion (0-100).</summary>
    public int MinimumScore { get; set; }

    /// <summary>Gets or sets the category of this criterion (e.g., "BANT", "Custom").</summary>
    public string Category { get; set; } = "Custom";

    /// <summary>Gets or sets AI question prompts for extracting this criterion.</summary>
    public string? AiQuestions { get; set; }
}

