// <copyright file="SurveyResponse.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a response to a survey.
/// </summary>
public class SurveyResponse : BaseEntity
{
    /// <summary>
    /// Gets or sets the survey ID.
    /// </summary>
    public Guid SurveyId { get; set; }

    /// <summary>
    /// Gets or sets the respondent's email (optional).
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the answers as JSON.
    /// </summary>
    public string Answers { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the overall score (for rating-based surveys).
    /// </summary>
    public decimal? Score { get; set; }

    /// <summary>
    /// Gets or sets the respondent's IP address.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the respondent's user agent.
    /// </summary>
    public string? UserAgent { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the survey this response belongs to.
    /// </summary>
    public Survey Survey { get; set; } = null!;
}
