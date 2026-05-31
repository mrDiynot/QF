// -----------------------------------------------------------------------
// <copyright file="IndustryScoringTemplate.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Pre-built scoring template for specific industries.
/// Provides industry-specific BANT weights and qualification criteria.
/// </summary>
public class IndustryScoringTemplate : BaseEntity
{
    /// <summary>Gets or sets the industry name.</summary>
    public string Industry { get; set; } = string.Empty;

    /// <summary>Gets or sets the template name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the template description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets a value indicating whether this is the default template for the industry.</summary>
    public bool IsDefault { get; set; }

    /// <summary>Gets or sets the qualification threshold (0-100).</summary>
    public int QualificationThreshold { get; set; } = 70;

    /// <summary>Gets or sets the AI weight (0-100).</summary>
    public int AIWeight { get; set; } = 60;

    /// <summary>Gets or sets the rules weight (0-100).</summary>
    public int RulesWeight { get; set; } = 40;

    /// <summary>Gets or sets the Budget BANT weight.</summary>
    public int BudgetWeight { get; set; } = 25;

    /// <summary>Gets or sets the Authority BANT weight.</summary>
    public int AuthorityWeight { get; set; } = 25;

    /// <summary>Gets or sets the Need BANT weight.</summary>
    public int NeedWeight { get; set; } = 25;

    /// <summary>Gets or sets the Timeline BANT weight.</summary>
    public int TimelineWeight { get; set; } = 25;

    /// <summary>Gets or sets industry-specific scoring criteria as JSON.</summary>
    public string? IndustryCriteriaJson { get; set; }

    /// <summary>Gets or sets industry-specific BANT questions as JSON.</summary>
    public string? BANTQuestionsJson { get; set; }

    /// <summary>Gets or sets typical objections and responses as JSON.</summary>
    public string? ObjectionHandlingJson { get; set; }

    /// <summary>Gets or sets industry-specific keywords for scoring.</summary>
    public string? IndustryKeywords { get; set; }

    /// <summary>Gets or sets a value indicating whether this template is active.</summary>
    public bool IsActive { get; set; } = true;
}
