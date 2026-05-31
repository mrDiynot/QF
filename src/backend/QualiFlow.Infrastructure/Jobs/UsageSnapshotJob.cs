using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to create daily snapshots of usage data for historical tracking and analytics.
/// </summary>
public partial class UsageSnapshotJob
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<UsageSnapshotJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="UsageSnapshotJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public UsageSnapshotJob(
        QualiFlowDbContext context,
        ILogger<UsageSnapshotJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Executes the usage snapshot job.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        LogStartingJob(_logger);

        var today = DateTime.UtcNow.Date;

        // Check if snapshots already exist for today (to avoid duplicates)
        var existingSnapshots = await _context.Set<UsageSnapshot>()
            .Where(s => s.SnapshotDate == today)
            .Select(s => s.BusinessId)
            .ToHashSetAsync();

        // Get all active usage counters
        var usageCounters = await _context.Set<UsageCounters>()
            .Include(uc => uc.Business)
                .ThenInclude(b => b.Subscription)
                    .ThenInclude(s => s!.Plan)
            .ToListAsync();

        LogFoundBusinesses(_logger, usageCounters.Count);

        var createdCount = 0;
        var skippedCount = 0;

        foreach (var counter in usageCounters)
        {
            // Skip counters for businesses that no longer exist (orphaned data)
            if (counter.Business == null || counter.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping usage snapshot for business {BusinessId} - business not found or deleted",
                    counter.BusinessId);
                skippedCount++;
                continue;
            }

            // Skip if snapshot already exists for this business today
            if (existingSnapshots.Contains(counter.BusinessId))
            {
                skippedCount++;
                continue;
            }

            // Create and persist snapshot record
            var snapshot = new UsageSnapshot
            {
                Id = Guid.NewGuid(),
                BusinessId = counter.BusinessId,
                SnapshotDate = today,
                PlanId = counter.Business.Subscription?.PlanId,
                PlanName = counter.Business.Subscription?.Plan?.Name,
                CurrentLeadsCount = counter.CurrentLeadsCount,
                CurrentChannelsCount = counter.CurrentChannelsCount,
                CurrentPhoneNumbersCount = counter.CurrentPhoneNumbersCount,
                CurrentSeatsCount = counter.CurrentSeatsCount,
                CurrentWorkflowsCount = counter.CurrentWorkflowsCount,
                CurrentCrmContactsCount = counter.CurrentCrmContactsCount,
                CurrentAiVoiceAgentsCount = counter.CurrentAiVoiceAgentsCount,
                MonthlyMessagesCount = counter.MonthlyMessagesCount,
                MonthlyAiConversationsCount = counter.MonthlyAiConversationsCount,
                MonthlyAiSmsCount = counter.MonthlyAiSmsCount,
                MonthlyAiVoiceMinutes = counter.MonthlyAiVoiceMinutes,
                MonthlyApiCallsCount = counter.MonthlyApiCallsCount,
                StorageUsedBytes = counter.StorageUsedBytes,
                KnowledgeBaseStorageBytes = counter.KnowledgeBaseStorageBytes,
                BillingCycleStart = counter.BillingCycleStart,
                BillingCycleEnd = counter.BillingCycleEnd,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Set<UsageSnapshot>().Add(snapshot);
            createdCount++;

            LogSnapshotCreated(
                _logger,
                counter.BusinessId,
                snapshot.CurrentLeadsCount,
                snapshot.MonthlyMessagesCount,
                snapshot.StorageUsedGB);
        }

        if (createdCount > 0)
        {
            await _context.SaveChangesAsync();
        }

        LogJobCompleted(_logger, createdCount, skippedCount);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Starting usage snapshot job")]
    private static partial void LogStartingJob(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Found {Count} businesses with usage counters")]
    private static partial void LogFoundBusinesses(ILogger logger, int count);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Created snapshot for business {BusinessId}: {LeadsCount} leads, {MessagesCount} messages, {StorageGB} GB storage")]
    private static partial void LogSnapshotCreated(ILogger logger, Guid businessId, int leadsCount, int messagesCount, decimal storageGb);

    [LoggerMessage(Level = LogLevel.Information, Message = "Usage snapshot job completed. Created {CreatedCount} snapshots, skipped {SkippedCount} (already exist)")]
    private static partial void LogJobCompleted(ILogger logger, int createdCount, int skippedCount);
}

