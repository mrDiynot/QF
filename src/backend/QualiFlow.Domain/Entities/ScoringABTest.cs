// -----------------------------------------------------------------------
// <copyright file="ScoringABTest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// A/B test configuration for scoring models.
/// Allows businesses to test different scoring configurations.
/// </summary>
public class ScoringABTest : BaseEntity
{
    /// <summary>Gets or sets the business ID (tenant) this test belongs to.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the test name.</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Gets or sets the test description.</summary>
    public string? Description { get; set; }

    /// <summary>Gets or sets the status of this A/B test.</summary>
    public ABTestStatus Status { get; set; } = ABTestStatus.Draft;

    /// <summary>Gets or sets the control variant configuration ID.</summary>
    public Guid ControlConfigurationId { get; set; }

    /// <summary>Gets or sets the treatment variant configuration ID.</summary>
    public Guid TreatmentConfigurationId { get; set; }

    /// <summary>Gets or sets the traffic percentage for treatment (0-100).</summary>
    public int TreatmentTrafficPercent { get; set; } = 50;

    /// <summary>Gets or sets the primary metric to measure (conversion_rate, qualification_rate, etc.).</summary>
    public string PrimaryMetric { get; set; } = "conversion_rate";

    /// <summary>Gets or sets the minimum sample size before declaring a winner.</summary>
    public int MinimumSampleSize { get; set; } = 100;

    /// <summary>Gets or sets the statistical significance threshold (e.g., 0.95).</summary>
    public decimal SignificanceThreshold { get; set; } = 0.95m;

    /// <summary>Gets or sets when the test started.</summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>Gets or sets when the test ended.</summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>Gets or sets the winning variant (control or treatment).</summary>
    public string? WinningVariant { get; set; }

    /// <summary>Gets or sets the control variant conversion count.</summary>
    public int ControlConversions { get; set; }

    /// <summary>Gets or sets the control variant total leads.</summary>
    public int ControlTotalLeads { get; set; }

    /// <summary>Gets or sets the treatment variant conversion count.</summary>
    public int TreatmentConversions { get; set; }

    /// <summary>Gets or sets the treatment variant total leads.</summary>
    public int TreatmentTotalLeads { get; set; }

    // Navigation Properties

    /// <summary>Gets or sets the business this test belongs to.</summary>
    public Business Business { get; set; } = null!;
}
