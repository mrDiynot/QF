using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to reset monthly usage counters at the start of each billing cycle.
/// </summary>
public class MonthlyUsageResetJob
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<MonthlyUsageResetJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MonthlyUsageResetJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public MonthlyUsageResetJob(
        QualiFlowDbContext context,
        ILogger<MonthlyUsageResetJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Executes the monthly usage reset job.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting monthly usage reset job");

        var today = DateTime.UtcNow.Date;

        // Find all usage counters where billing cycle has ended
        // Include Business to check for orphaned counters
        var countersToReset = await _context.Set<Domain.Entities.UsageCounters>()
            .Include(uc => uc.Business)
            .Where(uc => uc.BillingCycleEnd <= today)
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} usage counters to reset",
            countersToReset.Count);

        foreach (var counter in countersToReset)
        {
            // Skip counters for businesses that no longer exist (orphaned data)
            if (counter.Business == null || counter.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping usage reset for business {BusinessId} - business not found or deleted",
                    counter.BusinessId);
                continue;
            }

            // Reset monthly counters
            counter.MonthlyMessagesCount = 0;
            counter.MonthlyAiConversationsCount = 0;
            counter.MonthlyApiCallsCount = 0;

            // Update billing cycle dates (next month)
            var newCycleStart = counter.BillingCycleEnd?.AddDays(1) ?? DateTime.UtcNow;
            counter.BillingCycleStart = newCycleStart;
            counter.BillingCycleEnd = newCycleStart.AddMonths(1).AddDays(-1);

            _logger.LogInformation(
                "Reset usage counters for business {BusinessId}. New cycle: {Start} to {End}",
                counter.BusinessId,
                counter.BillingCycleStart,
                counter.BillingCycleEnd);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Monthly usage reset job completed. Reset {Count} counters",
            countersToReset.Count);
    }
}

