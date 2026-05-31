using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to retry failed payments (3 attempts over 7 days).
/// </summary>
public class PaymentRetryJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<PaymentRetryJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PaymentRetryJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="emailService">The email service for sending notifications.</param>
    /// <param name="notificationService">The in-app notification service.</param>
    /// <param name="logger">The logger.</param>
    public PaymentRetryJob(
        QualiFlowDbContext context,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<PaymentRetryJob> logger)
    {
        _context = context;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the payment retry job.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting payment retry job");

        var today = DateTime.UtcNow.Date;
        var lookbackDate = today.AddDays(-SubscriptionConstants.FailedPaymentLookbackDays);

        // Find subscriptions with failed payments in the lookback window
        var failedPayments = await _context.Set<Domain.Entities.BillingTransaction>()
            .Include(bt => bt.Subscription)
                .ThenInclude(s => s!.Business)
            .Where(bt => bt.Type == "payment" &&
                        bt.Status == "failed" &&
                        bt.CreatedAt >= lookbackDate &&
                        bt.CreatedAt <= today &&
                        bt.SubscriptionId != null)
            .GroupBy(bt => bt.SubscriptionId!.Value)
            .Select(g => new
            {
                SubscriptionId = g.Key,
                FailureCount = g.Count(),
                LastFailure = g.Max(bt => bt.CreatedAt)
            })
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} subscriptions with failed payments in last {Days} days",
            failedPayments.Count,
            SubscriptionConstants.FailedPaymentLookbackDays);

        foreach (var payment in failedPayments)
        {
            var subscription = await _context.Set<Domain.Entities.Subscription>()
                .Include(s => s.Business)
                .FirstOrDefaultAsync(s => s.Id == payment.SubscriptionId);

            if (subscription == null)
            {
                continue;
            }

            // Skip subscriptions for businesses that no longer exist (orphaned data)
            if (subscription.Business == null || subscription.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping payment retry for subscription {SubscriptionId} - business {BusinessId} not found or deleted",
                    subscription.Id,
                    subscription.BusinessId);
                continue;
            }

            if (payment.FailureCount >= SubscriptionConstants.MaxFailedPaymentAttempts)
            {
                // Suspend subscription after max failed attempts
                if (subscription.Status != SubscriptionStatus.Suspended)
                {
                    subscription.Status = SubscriptionStatus.Suspended;

                    _logger.LogWarning(
                        "Suspended subscription {SubscriptionId} for business {BusinessId} after {FailureCount} failed payment attempts",
                        subscription.Id,
                        subscription.BusinessId,
                        payment.FailureCount);

                    // Send subscription suspended notification (email + in-app)
                    try
                    {
                        // Email notification
                        await _emailService.SendSubscriptionSuspendedNotificationAsync(
                            subscription.BusinessId,
                            payment.FailureCount,
                            CancellationToken.None);

                        // In-app notification
                        await _notificationService.NotifySubscriptionSuspendedAsync(
                            subscription.BusinessId,
                            CancellationToken.None);

                        _logger.LogInformation(
                            "Sent subscription suspended notification to business {BusinessId}",
                            subscription.BusinessId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(
                            ex,
                            "Failed to send subscription suspended notification to business {BusinessId}",
                            subscription.BusinessId);
                    }
                }
            }
            else
            {
                _logger.LogInformation(
                    "Subscription {SubscriptionId} has {FailureCount} failed payment attempts. Will retry.",
                    subscription.Id,
                    payment.FailureCount);

                // Send payment failed in-app notification
                try
                {
                    await _notificationService.NotifyPaymentFailedAsync(
                        subscription.BusinessId,
                        payment.FailureCount,
                        CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to send payment failed notification to business {BusinessId}",
                        subscription.BusinessId);
                }

                // NOTE: Stripe automatic retry is handled by Stripe's built-in retry logic
                // Manual retry can be implemented in future sprint if needed
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Payment retry job completed. Processed {Count} failed payments",
            failedPayments.Count);
    }
}

