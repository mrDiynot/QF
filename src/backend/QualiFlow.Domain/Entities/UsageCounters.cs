using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents real-time usage counters for a business.
/// Updated via database triggers for performance.
/// </summary>
public class UsageCounters : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    // Current usage (updated in real-time)

    /// <summary>
    /// Gets or sets the current number of active leads.
    /// </summary>
    public int CurrentLeadsCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of active channels.
    /// </summary>
    public int CurrentChannelsCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of phone numbers.
    /// </summary>
    public int CurrentPhoneNumbersCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of team seats.
    /// </summary>
    public int CurrentSeatsCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of active workflows.
    /// </summary>
    public int CurrentWorkflowsCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of CRM contacts.
    /// </summary>
    public int CurrentCrmContactsCount { get; set; }

    /// <summary>
    /// Gets or sets the current number of AI voice agents.
    /// </summary>
    public int CurrentAiVoiceAgentsCount { get; set; }

    // Monthly usage (reset at billing cycle)

    /// <summary>
    /// Gets or sets the monthly message count.
    /// </summary>
    public int MonthlyMessagesCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI conversation count (AI interactions).
    /// </summary>
    public int MonthlyAiConversationsCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI SMS count.
    /// </summary>
    public int MonthlyAiSmsCount { get; set; }

    /// <summary>
    /// Gets or sets the monthly AI voice minutes used.
    /// </summary>
    public int MonthlyAiVoiceMinutes { get; set; }

    /// <summary>
    /// Gets or sets the monthly API calls count.
    /// </summary>
    public int MonthlyApiCallsCount { get; set; }

    // Storage usage

    /// <summary>
    /// Gets or sets the storage used in bytes.
    /// </summary>
    public long StorageUsedBytes { get; set; }

    /// <summary>
    /// Gets or sets the knowledge base storage used in bytes.
    /// </summary>
    public long KnowledgeBaseStorageBytes { get; set; }

    // Billing cycle tracking

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
    /// Gets or sets the business these counters belong to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the storage used in gigabytes.
    /// </summary>
    public double StorageUsedGB => StorageUsedBytes / (1024.0 * 1024.0 * 1024.0);

    /// <summary>
    /// Gets the knowledge base storage used in megabytes.
    /// </summary>
    public double KnowledgeBaseStorageMB => KnowledgeBaseStorageBytes / (1024.0 * 1024.0);
}

