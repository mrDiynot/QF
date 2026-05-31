// -----------------------------------------------------------------------
// <copyright file="UsageSnapshot.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a daily snapshot of usage data for historical tracking and analytics.
/// </summary>
public class UsageSnapshot : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the snapshot date (date only, no time component).
    /// </summary>
    public DateTime SnapshotDate { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan ID at the time of snapshot.
    /// </summary>
    public Guid? PlanId { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan name at the time of snapshot.
    /// </summary>
    public string? PlanName { get; set; }

    // Current counts (lifetime/current)

    /// <summary>
    /// Gets or sets the current leads count.
    /// </summary>
    public int CurrentLeadsCount { get; set; }

    /// <summary>
    /// Gets or sets the current channels count.
    /// </summary>
    public int CurrentChannelsCount { get; set; }

    /// <summary>
    /// Gets or sets the current phone numbers count.
    /// </summary>
    public int CurrentPhoneNumbersCount { get; set; }

    /// <summary>
    /// Gets or sets the current seats count.
    /// </summary>
    public int CurrentSeatsCount { get; set; }

    /// <summary>
    /// Gets or sets the current workflows count.
    /// </summary>
    public int CurrentWorkflowsCount { get; set; }

    /// <summary>
    /// Gets or sets the current CRM contacts count.
    /// </summary>
    public int CurrentCrmContactsCount { get; set; }

    /// <summary>
    /// Gets or sets the current AI voice agents count.
    /// </summary>
    public int CurrentAiVoiceAgentsCount { get; set; }

    // Monthly counts (reset at billing cycle)

    /// <summary>
    /// Gets or sets the monthly messages count.
    /// </summary>
    public int MonthlyMessagesCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI conversations count.
    /// </summary>
    public int MonthlyAiConversationsCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI SMS count.
    /// </summary>
    public int MonthlyAiSmsCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI voice minutes.
    /// </summary>
    public int MonthlyAiVoiceMinutes { get; set; }

    /// <summary>
    /// Gets or sets the monthly API calls count.
    /// </summary>
    public int MonthlyApiCallsCount { get; set; }

    // Storage

    /// <summary>
    /// Gets or sets the storage used in bytes.
    /// </summary>
    public long StorageUsedBytes { get; set; }

    /// <summary>
    /// Gets or sets the knowledge base storage in bytes.
    /// </summary>
    public long KnowledgeBaseStorageBytes { get; set; }

    /// <summary>
    /// Gets the storage used in GB (computed from bytes).
    /// </summary>
    public decimal StorageUsedGB => Math.Round(StorageUsedBytes / (decimal)(1024 * 1024 * 1024), 2);

    // Billing cycle info

    /// <summary>
    /// Gets or sets the billing cycle start date.
    /// </summary>
    public DateTime? BillingCycleStart { get; set; }

    /// <summary>
    /// Gets or sets the billing cycle end date.
    /// </summary>
    public DateTime? BillingCycleEnd { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;
}

