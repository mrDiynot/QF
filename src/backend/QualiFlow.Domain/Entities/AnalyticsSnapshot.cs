// <copyright file="AnalyticsSnapshot.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Pre-computed analytics snapshot for a business.
/// Computed periodically by background job for consistent dashboard display.
/// </summary>
public class AnalyticsSnapshot : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID this snapshot belongs to.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the snapshot date (UTC).
    /// </summary>
    public DateTime SnapshotDate { get; set; }

    /// <summary>
    /// Gets or sets the snapshot period type.
    /// </summary>
    public SnapshotPeriod Period { get; set; }

    // ============================================================================
    // Dashboard Metrics
    // ============================================================================

    /// <summary>
    /// Gets or sets the total leads count.
    /// </summary>
    public int TotalLeads { get; set; }

    /// <summary>
    /// Gets or sets the qualified leads count.
    /// </summary>
    public int QualifiedLeads { get; set; }

    /// <summary>
    /// Gets or sets the total conversations count.
    /// </summary>
    public int TotalConversations { get; set; }

    /// <summary>
    /// Gets or sets the total messages count.
    /// </summary>
    public int TotalMessages { get; set; }

    /// <summary>
    /// Gets or sets the average response time in seconds.
    /// </summary>
    public decimal AverageResponseTime { get; set; }

    /// <summary>
    /// Gets or sets the conversion rate percentage.
    /// </summary>
    public decimal ConversionRate { get; set; }

    /// <summary>
    /// Gets or sets the active channels count.
    /// </summary>
    public int ActiveChannels { get; set; }

    // ============================================================================
    // Channel Performance (JSON serialized)
    // ============================================================================

    /// <summary>
    /// Gets or sets the channel performance data as JSON.
    /// Contains per-channel metrics including leads, conversions, and response times.
    /// </summary>
    public string? ChannelPerformanceJson { get; set; }

    // ============================================================================
    // AI Performance Metrics
    // ============================================================================

    /// <summary>
    /// Gets or sets the total AI interactions count.
    /// </summary>
    public int TotalAIInteractions { get; set; }

    /// <summary>
    /// Gets or sets the AI coverage rate percentage.
    /// </summary>
    public decimal AICoverageRate { get; set; }

    /// <summary>
    /// Gets or sets the AI qualification rate percentage.
    /// </summary>
    public decimal AIQualificationRate { get; set; }

    // ============================================================================
    // Conversion Funnel
    // ============================================================================

    /// <summary>
    /// Gets or sets the leads with conversation count.
    /// </summary>
    public int LeadsWithConversation { get; set; }

    /// <summary>
    /// Gets or sets the leads with booking count.
    /// </summary>
    public int LeadsWithBooking { get; set; }

    /// <summary>
    /// Gets or sets the converted leads count.
    /// </summary>
    public int ConvertedLeads { get; set; }

    // ============================================================================
    // Navigation Properties
    // ============================================================================

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;
}
