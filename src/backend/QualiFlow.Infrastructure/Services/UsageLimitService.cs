using System.Globalization;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Constants;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for checking and enforcing subscription usage limits.
/// </summary>
public class UsageLimitService : IUsageLimitService
{
    private readonly QualiFlowDbContext _context;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<UsageLimitService> _logger;

    public UsageLimitService(
        QualiFlowDbContext context,
        ISubscriptionService subscriptionService,
        ILogger<UsageLimitService> logger)
    {
        _context = context;
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    // ========== HELPER METHODS ==========

    private static int ParseLimit(string? value, int defaultValue)
    {
        if (string.IsNullOrEmpty(value) || value.Equals("unlimited", StringComparison.OrdinalIgnoreCase))
        {
            return int.MaxValue;
        }

        return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var result)
            ? result
            : defaultValue;
    }

    // ========== LIMIT CHECKING METHODS ==========

    /// <inheritdoc/>
    public async Task<bool> CanCreateLeadAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxLeads = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxLeads), 25);
        var canCreate = usage.CurrentLeadsCount < maxLeads;

        if (!canCreate)
        {
            _logger.LogWarning(
                "Lead limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentLeadsCount,
                maxLeads);
        }

        return canCreate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanSendMessageAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxMessages = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxMessages), int.MaxValue);

        // Messages are soft limit - allow overage with charges
        if (usage.MonthlyMessagesCount >= maxMessages && maxMessages != int.MaxValue)
        {
            _logger.LogInformation(
                "Message overage for business {BusinessId}. Current: {Current}, Limit: {Limit}. Overage charges will apply.",
                businessId,
                usage.MonthlyMessagesCount,
                maxMessages);
        }

        return true; // Soft limit - always allow
    }

    /// <inheritdoc/>
    public async Task<bool> CanCreateChannelAsync(Guid businessId, string channelType, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxChannels = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxChannels), 10);
        var canCreate = usage.CurrentChannelsCount < maxChannels;

        if (!canCreate)
        {
            _logger.LogWarning(
                "Channel limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentChannelsCount,
                maxChannels);
        }

        return canCreate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanCreateWorkflowAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxWorkflows = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxWorkflows), 1);
        var canCreate = usage.CurrentWorkflowsCount < maxWorkflows;

        if (!canCreate)
        {
            _logger.LogWarning(
                "Workflow limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentWorkflowsCount,
                maxWorkflows);
        }

        return canCreate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanCreateCrmContactAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxCrmContacts = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxCrmContacts), 100);
        var canCreate = usage.CurrentCrmContactsCount < maxCrmContacts;

        if (!canCreate)
        {
            _logger.LogWarning(
                "CRM contact limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentCrmContactsCount,
                maxCrmContacts);
        }

        return canCreate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanAddTeamMemberAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxSeats = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxSeats), 1);
        var canAdd = usage.CurrentSeatsCount < maxSeats;

        if (!canAdd)
        {
            _logger.LogWarning(
                "Team member limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentSeatsCount,
                maxSeats);
        }

        return canAdd;
    }

    /// <inheritdoc/>
    public async Task<bool> CanUseAiInteractionAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxAiInteractions = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxAiInteractions), 50);
        var canUse = usage.MonthlyAiConversationsCount < maxAiInteractions;

        if (!canUse)
        {
            _logger.LogWarning(
                "AI interaction limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.MonthlyAiConversationsCount,
                maxAiInteractions);
        }

        return canUse;
    }

    /// <inheritdoc/>
    public async Task<bool> CanSendAiSmsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxAiSms = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxAiSms), 10);
        var canSend = usage.MonthlyAiSmsCount < maxAiSms;

        if (!canSend)
        {
            _logger.LogWarning(
                "AI SMS limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.MonthlyAiSmsCount,
                maxAiSms);
        }

        return canSend;
    }

    /// <inheritdoc/>
    public async Task<bool> CanUseAiVoiceMinutesAsync(Guid businessId, int minutes, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxVoiceMinutes = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxAiVoiceMinutes), 3);
        var canUse = (usage.MonthlyAiVoiceMinutes + minutes) <= maxVoiceMinutes;

        if (!canUse)
        {
            _logger.LogWarning(
                "AI voice minutes limit reached for business {BusinessId}. Current: {Current}, Requested: {Requested}, Limit: {Limit}",
                businessId,
                usage.MonthlyAiVoiceMinutes,
                minutes,
                maxVoiceMinutes);
        }

        return canUse;
    }

    /// <inheritdoc/>
    public async Task<bool> CanCreateAiVoiceAgentAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxAgents = ParseLimit(limits.GetValueOrDefault(LimitConstants.MaxAiVoiceAgents), 3);
        var canCreate = usage.CurrentAiVoiceAgentsCount < maxAgents;

        if (!canCreate)
        {
            _logger.LogWarning(
                "AI voice agent limit reached for business {BusinessId}. Current: {Current}, Limit: {Limit}",
                businessId,
                usage.CurrentAiVoiceAgentsCount,
                maxAgents);
        }

        return canCreate;
    }

    /// <inheritdoc/>
    public async Task<bool> CanUseKnowledgeBaseStorageAsync(Guid businessId, long additionalBytes, CancellationToken cancellationToken)
    {
        var limits = await _subscriptionService.GetBusinessLimitsAsync(businessId, cancellationToken);
        var usage = await EnsureUsageCountersExistAsync(businessId, cancellationToken);

        var maxKbMb = ParseLimit(limits.GetValueOrDefault("knowledge_base_size_mb"), 5);
        var maxKbBytes = maxKbMb * 1024L * 1024L;
        var canUse = (usage.KnowledgeBaseStorageBytes + additionalBytes) <= maxKbBytes;

        if (!canUse)
        {
            _logger.LogWarning(
                "Knowledge base storage limit reached for business {BusinessId}. Current: {Current}MB, Limit: {Limit}MB",
                businessId,
                usage.KnowledgeBaseStorageMB,
                maxKbMb);
        }

        return canUse;
    }

    // ========== USAGE RETRIEVAL ==========

    /// <inheritdoc/>
    public Task<UsageCounters?> GetUsageCountersAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return _context.Set<UsageCounters>()
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.BusinessId == businessId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<UsageCounters> EnsureUsageCountersExistAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var usage = await _context.Set<UsageCounters>()
            .FirstOrDefaultAsync(u => u.BusinessId == businessId, cancellationToken);

        if (usage != null)
        {
            return usage;
        }

        // Create new usage counters for this business
        usage = new UsageCounters
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            CurrentLeadsCount = 0,
            CurrentChannelsCount = 0,
            CurrentPhoneNumbersCount = 0,
            CurrentSeatsCount = 1, // Owner counts as 1 seat
            CurrentWorkflowsCount = 0,
            CurrentCrmContactsCount = 0,
            CurrentAiVoiceAgentsCount = 0,
            MonthlyMessagesCount = 0,
            MonthlyAiConversationsCount = 0,
            MonthlyAiSmsCount = 0,
            MonthlyAiVoiceMinutes = 0,
            MonthlyApiCallsCount = 0,
            StorageUsedBytes = 0,
            KnowledgeBaseStorageBytes = 0,
            BillingCycleStart = DateTime.UtcNow,
            BillingCycleEnd = DateTime.UtcNow.AddMonths(1),
            CreatedAt = DateTime.UtcNow,
        };

        _context.Set<UsageCounters>().Add(usage);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created usage counters for business {BusinessId}", businessId);
        return usage;
    }

    // ========== INCREMENT METHODS ==========

    /// <inheritdoc/>
    public async Task IncrementLeadsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentLeadsCount, u => u.CurrentLeadsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementLeadsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentLeadsCount > 0)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentLeadsCount, u => u.CurrentLeadsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementMessagesAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.MonthlyMessagesCount, u => u.MonthlyMessagesCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementChannelsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentChannelsCount, u => u.CurrentChannelsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementChannelsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentChannelsCount > 0)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentChannelsCount, u => u.CurrentChannelsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementWorkflowsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentWorkflowsCount, u => u.CurrentWorkflowsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementWorkflowsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentWorkflowsCount > 0)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentWorkflowsCount, u => u.CurrentWorkflowsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementSeatsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentSeatsCount, u => u.CurrentSeatsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementSeatsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentSeatsCount > 1) // Never go below 1 (owner)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentSeatsCount, u => u.CurrentSeatsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementCrmContactsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentCrmContactsCount, u => u.CurrentCrmContactsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementCrmContactsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentCrmContactsCount > 0)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentCrmContactsCount, u => u.CurrentCrmContactsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementAiInteractionsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.MonthlyAiConversationsCount, u => u.MonthlyAiConversationsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementAiSmsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.MonthlyAiSmsCount, u => u.MonthlyAiSmsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task AddAiVoiceMinutesAsync(Guid businessId, int minutes, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.MonthlyAiVoiceMinutes, u => u.MonthlyAiVoiceMinutes + minutes)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementAiVoiceAgentsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentAiVoiceAgentsCount, u => u.CurrentAiVoiceAgentsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DecrementAiVoiceAgentsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId && u.CurrentAiVoiceAgentsCount > 0)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.CurrentAiVoiceAgentsCount, u => u.CurrentAiVoiceAgentsCount - 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task AddKnowledgeBaseStorageAsync(Guid businessId, long bytes, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.KnowledgeBaseStorageBytes, u => u.KnowledgeBaseStorageBytes + bytes)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task IncrementApiCallsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        await _context.Set<UsageCounters>()
            .Where(u => u.BusinessId == businessId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(u => u.MonthlyApiCallsCount, u => u.MonthlyApiCallsCount + 1)
                    .SetProperty(u => u.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }

    // ========== RESET METHODS ==========

    /// <inheritdoc/>
    public async Task ResetMonthlyCountersAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var usage = await _context.Set<UsageCounters>()
            .FirstOrDefaultAsync(u => u.BusinessId == businessId, cancellationToken);

        if (usage == null)
        {
            _logger.LogWarning("Usage counters not found for business {BusinessId}", businessId);
            return;
        }

        _logger.LogInformation("Resetting monthly counters for business {BusinessId}", businessId);

        usage.MonthlyMessagesCount = 0;
        usage.MonthlyAiConversationsCount = 0;
        usage.MonthlyAiSmsCount = 0;
        usage.MonthlyAiVoiceMinutes = 0;
        usage.MonthlyApiCallsCount = 0;
        usage.BillingCycleStart = DateTime.UtcNow;
        usage.BillingCycleEnd = DateTime.UtcNow.AddMonths(1);
        usage.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Monthly counters reset for business {BusinessId}", businessId);
    }
}

