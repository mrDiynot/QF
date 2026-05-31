// -----------------------------------------------------------------------
// <copyright file="LeadEnrichment.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Stores enriched data about a lead from external data providers.
/// Supports Clearbit, ZoomInfo, and other enrichment services.
/// </summary>
public class LeadEnrichment : BaseEntity
{
    /// <summary>Gets or sets the lead ID this enrichment belongs to.</summary>
    public Guid LeadId { get; set; }

    /// <summary>Gets or sets the enrichment source (Clearbit, ZoomInfo, LinkedIn, etc.).</summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>Gets or sets the company name.</summary>
    public string? CompanyName { get; set; }

    /// <summary>Gets or sets the company domain.</summary>
    public string? CompanyDomain { get; set; }

    /// <summary>Gets or sets the company industry.</summary>
    public string? CompanyIndustry { get; set; }

    /// <summary>Gets or sets the company size range.</summary>
    public string? CompanySize { get; set; }

    /// <summary>Gets or sets the estimated company revenue.</summary>
    public string? CompanyRevenue { get; set; }

    /// <summary>Gets or sets the company location/headquarters.</summary>
    public string? CompanyLocation { get; set; }

    /// <summary>Gets or sets the company LinkedIn URL.</summary>
    public string? CompanyLinkedIn { get; set; }

    /// <summary>Gets or sets the person's job title.</summary>
    public string? JobTitle { get; set; }

    /// <summary>Gets or sets the person's seniority level.</summary>
    public string? Seniority { get; set; }

    /// <summary>Gets or sets the person's department.</summary>
    public string? Department { get; set; }

    /// <summary>Gets or sets the person's LinkedIn URL.</summary>
    public string? PersonLinkedIn { get; set; }

    /// <summary>Gets or sets the person's Twitter handle.</summary>
    public string? TwitterHandle { get; set; }

    /// <summary>Gets or sets the confidence score for this enrichment (0-100).</summary>
    public int ConfidenceScore { get; set; }

    /// <summary>Gets or sets a value indicating whether this is a decision maker (based on title/seniority).</summary>
    public bool IsDecisionMaker { get; set; }

    /// <summary>Gets or sets the raw JSON response from the enrichment API.</summary>
    public string? RawResponseJson { get; set; }

    /// <summary>Gets or sets when this enrichment was last updated.</summary>
    public DateTime EnrichedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Gets or sets when this enrichment expires and should be refreshed.</summary>
    public DateTime? ExpiresAt { get; set; }

    // Navigation Properties

    /// <summary>Gets or sets the lead this enrichment belongs to.</summary>
    public Lead Lead { get; set; } = null!;
}
