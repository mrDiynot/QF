// <copyright file="Survey.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a customer survey.
/// </summary>
public class Survey : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the survey name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the survey description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the survey status (draft, published, archived).
    /// </summary>
    public string Status { get; set; } = "draft";

    /// <summary>
    /// Gets or sets the survey questions as JSON.
    /// </summary>
    public string Questions { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the total number of responses.
    /// </summary>
    public int ResponseCount { get; set; }

    /// <summary>
    /// Gets or sets the average score (for rating-based surveys).
    /// </summary>
    public decimal? AverageScore { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the survey is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this survey belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the survey responses.
    /// </summary>
    public ICollection<SurveyResponse> Responses { get; } = new List<SurveyResponse>();
}
