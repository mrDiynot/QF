// -----------------------------------------------------------------------
// <copyright file="ScoreHistory.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a historical record of a lead's score change.
/// Used for tracking score evolution and understanding qualification decisions.
/// </summary>
public class ScoreHistory : BaseEntity
{
    /// <summary>
    /// Gets or sets the lead ID this score history belongs to.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the score value at this point in time (0-100).
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Gets or sets the previous score before this change.
    /// </summary>
    public int? PreviousScore { get; set; }

    /// <summary>
    /// Gets or sets the change in score from previous value.
    /// </summary>
    public int ScoreChange { get; set; }

    /// <summary>
    /// Gets or sets the source of the score (e.g., "AI", "Manual", "Rule").
    /// </summary>
    public string Source { get; set; } = "AI";

    /// <summary>
    /// Gets or sets the reason for the score change.
    /// </summary>
    public string? Reason { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized breakdown of scoring factors.
    /// </summary>
    public string? ScoreBreakdown { get; set; }

    /// <summary>
    /// Gets or sets when the score was recorded.
    /// </summary>
    public DateTime ScoredAt { get; set; } = DateTime.UtcNow;

    // Navigation properties

    /// <summary>
    /// Gets or sets the lead this score history belongs to.
    /// </summary>
    public Lead Lead { get; set; } = null!;
}

