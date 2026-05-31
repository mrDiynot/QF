using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to reconcile subscription intents that have completed payments
/// but haven't been processed by webhooks (e.g., webhook failures, race conditions).
/// Runs every 5 minutes to ensure subscriptions are upgraded promptly.
/// </summary>
public class SubscriptionIntentReconciliationJob
{
    private readonly QualiFlowDbContext _context;
    private readonly ISubscriptionService _subscriptionService;
    private readonly ILogger<SubscriptionIntentReconciliationJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SubscriptionIntentReconciliationJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="subscriptionService">The subscription service.</param>
    /// <param name="logger">The logger.</param>
    public SubscriptionIntentReconciliationJob(
        QualiFlowDbContext context,
        ISubscriptionService subscriptionService,
        ILogger<SubscriptionIntentReconciliationJob> logger)
    {
        _context = context;
        _subscriptionService = subscriptionService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the subscription intent reconciliation job.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting subscription intent reconciliation job");

        var cutoffTime = DateTime.UtcNow.AddHours(-24); // Only check intents from last 24 hours

        // Find completed intents where the subscription hasn't been upgraded yet
        var completedIntents = await _context.SubscriptionIntents
            .Include(si => si.IntendedPlan)
            .Include(si => si.Business)
                .ThenInclude(b => b.Subscription)
            .Where(si => si.Status == SubscriptionIntentStatus.Completed)
            .Where(si => si.CompletedAt > cutoffTime)
            .Where(si => si.Business != null && si.Business.Subscription != null)
            .Where(si => si.Business!.Subscription!.PlanId != si.IntendedPlanId) // Subscription not yet upgraded
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} completed subscription intents requiring reconciliation",
            completedIntents.Count);

        var reconciledCount = 0;
        var failedCount = 0;

        foreach (var intent in completedIntents)
        {
            try
            {
                _logger.LogInformation(
                    "Reconciling subscription for business {BusinessId}: upgrading from plan {CurrentPlanId} to {IntendedPlanId}",
                    intent.BusinessId,
                    intent.Business?.Subscription?.PlanId,
                    intent.IntendedPlanId);

                await _subscriptionService.UpgradeSubscriptionAsync(
                    intent.BusinessId,
                    intent.IntendedPlanId,
                    CancellationToken.None);

                reconciledCount++;

                _logger.LogInformation(
                    "Successfully reconciled subscription for business {BusinessId} to plan {PlanName}",
                    intent.BusinessId,
                    intent.IntendedPlan?.DisplayName ?? intent.IntendedPlan?.Name);
            }
            catch (Exception ex)
            {
                failedCount++;
                _logger.LogError(
                    ex,
                    "Failed to reconcile subscription for business {BusinessId} to plan {IntendedPlanId}",
                    intent.BusinessId,
                    intent.IntendedPlanId);
            }
        }

        _logger.LogInformation(
            "Subscription intent reconciliation job completed. Reconciled: {Reconciled}, Failed: {Failed}",
            reconciledCount,
            failedCount);
    }
}

