// -----------------------------------------------------------------------
// <copyright file="BusinessScoringConfiguration.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Persisted scoring configuration for a business.
/// Allows businesses to customize their lead qualification thresholds and weights.
/// </summary>
public class BusinessScoringConfiguration : BaseEntity
{
    /// <summary>Gets or sets the business ID (tenant) this configuration belongs to.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the minimum score threshold for qualification (0-100).</summary>
    public int QualificationThreshold { get; set; } = 70;

    /// <summary>Gets or sets the weight for AI-based scoring (0-100).</summary>
    public int AIWeight { get; set; } = 60;

    /// <summary>Gets or sets the weight for business rules scoring (0-100).</summary>
    public int RulesWeight { get; set; } = 40;

    /// <summary>Gets or sets the Budget BANT weight (0-100).</summary>
    public int BudgetWeight { get; set; } = 25;

    /// <summary>Gets or sets the Authority BANT weight (0-100).</summary>
    public int AuthorityWeight { get; set; } = 25;

    /// <summary>Gets or sets the Need BANT weight (0-100).</summary>
    public int NeedWeight { get; set; } = 25;

    /// <summary>Gets or sets the Timeline BANT weight (0-100).</summary>
    public int TimelineWeight { get; set; } = 25;

    /// <summary>Gets or sets the score threshold for Contacted status.</summary>
    public int ContactedThreshold { get; set; } = 20;

    /// <summary>Gets or sets the score threshold for Engaged status.</summary>
    public int EngagedThreshold { get; set; } = 40;

    /// <summary>Gets or sets the score threshold for Qualified status.</summary>
    public int QualifiedThreshold { get; set; } = 70;

    /// <summary>Gets or sets the score threshold for Opportunity status.</summary>
    public int OpportunityThreshold { get; set; } = 85;

    /// <summary>Gets or sets a value indicating whether to auto-transition lead status based on score.</summary>
    public bool AutoTransitionStatus { get; set; } = true;

    /// <summary>Gets or sets a value indicating whether AI scoring is enabled.</summary>
    public bool AIScoreEnabled { get; set; } = true;

    /// <summary>Gets or sets the days after which an inactive lead's score decays.</summary>
    public int ScoreDecayDays { get; set; } = 14;

    /// <summary>Gets or sets the percentage to decay score by per decay period (0-100).</summary>
    public int ScoreDecayPercentage { get; set; } = 10;

    /// <summary>Gets or sets the scoring model version for A/B testing.</summary>
    public string? ScoringModelVersion { get; set; }

    /// <summary>Gets or sets custom scoring rules as JSON.</summary>
    public string? CustomRulesJson { get; set; }

    /// <summary>Gets or sets the industry template this configuration is based on.</summary>
    public string? IndustryTemplate { get; set; }

    // Navigation Properties

    /// <summary>Gets or sets the business this configuration belongs to.</summary>
    public Business Business { get; set; } = null!;
}
