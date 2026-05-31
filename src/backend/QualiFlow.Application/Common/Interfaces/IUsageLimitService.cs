using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service for checking and enforcing subscription usage limits.
/// </summary>
public interface IUsageLimitService
{
    // ========== LIMIT CHECKING METHODS ==========

    /// <summary>Checks if a business can create a new lead (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanCreateLeadAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can send a message (within limit or soft limit with overage).</summary>
    /// <returns>True if allowed (hard limit or soft limit), false otherwise.</returns>
    Task<bool> CanSendMessageAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can create a new channel (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanCreateChannelAsync(Guid businessId, string channelType, CancellationToken cancellationToken);

    /// <summary>Checks if a business can create a new workflow (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanCreateWorkflowAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can create a new CRM contact (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanCreateCrmContactAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can add a new team member (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanAddTeamMemberAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can use AI interactions (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanUseAiInteractionAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can send AI SMS (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanSendAiSmsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can use AI voice minutes (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanUseAiVoiceMinutesAsync(Guid businessId, int minutes, CancellationToken cancellationToken);

    /// <summary>Checks if a business can create an AI voice agent (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanCreateAiVoiceAgentAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Checks if a business can use knowledge base storage (within limit).</summary>
    /// <returns>True if within limit, false otherwise.</returns>
    Task<bool> CanUseKnowledgeBaseStorageAsync(Guid businessId, long additionalBytes, CancellationToken cancellationToken);

    // ========== USAGE RETRIEVAL ==========

    /// <summary>Gets the current usage counters for a business.</summary>
    /// <returns>The usage counters or null if not found.</returns>
    Task<UsageCounters?> GetUsageCountersAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Ensures usage counters exist for a business, creating them if necessary.</summary>
    /// <returns>The existing or newly created usage counters.</returns>
    Task<UsageCounters> EnsureUsageCountersExistAsync(Guid businessId, CancellationToken cancellationToken);

    // ========== INCREMENT METHODS ==========

    /// <summary>Increments the lead count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementLeadsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the lead count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementLeadsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the monthly message count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementMessagesAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the channel count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementChannelsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the channel count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementChannelsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the workflow count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementWorkflowsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the workflow count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementWorkflowsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the team member (seat) count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementSeatsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the team member (seat) count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementSeatsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the CRM contact count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementCrmContactsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the CRM contact count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementCrmContactsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the monthly AI interaction count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementAiInteractionsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Increments the monthly AI SMS count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementAiSmsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Adds AI voice minutes used for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAiVoiceMinutesAsync(Guid businessId, int minutes, CancellationToken cancellationToken);

    /// <summary>Increments the AI voice agent count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementAiVoiceAgentsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Decrements the AI voice agent count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DecrementAiVoiceAgentsAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>Adds knowledge base storage usage for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddKnowledgeBaseStorageAsync(Guid businessId, long bytes, CancellationToken cancellationToken);

    /// <summary>Increments the monthly API calls count for a business.</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementApiCallsAsync(Guid businessId, CancellationToken cancellationToken);

    // ========== RESET METHODS ==========

    /// <summary>Resets monthly usage counters for a business (called at billing cycle).</summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ResetMonthlyCountersAsync(Guid businessId, CancellationToken cancellationToken);
}

