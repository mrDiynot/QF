using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to check for expiring trials and send notifications.
/// </summary>
public class TrialExpirationCheckJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<TrialExpirationCheckJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TrialExpirationCheckJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="emailService">The email service for sending notifications.</param>
    /// <param name="notificationService">The in-app notification service.</param>
    /// <param name="logger">The logger.</param>
    public TrialExpirationCheckJob(
        QualiFlowDbContext context,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<TrialExpirationCheckJob> logger)
    {
        _context = context;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the trial expiration check job.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting trial expiration check job");

        var today = DateTime.UtcNow.Date;
        var warningDate = today.AddDays(EmailConstants.TrialExpirationWarningDays);

        // Find trials expiring in configured days (for warning notification)
        // Filter to only include subscriptions with existing, non-deleted businesses
        var trialsExpiringSoon = await _context.Set<Domain.Entities.Subscription>()
            .Include(s => s.Business)
            .Where(s => s.Status == SubscriptionStatus.Trial &&
                       s.TrialEnd.HasValue &&
                       s.TrialEnd.Value.Date == warningDate)
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} trials expiring in {Days} days",
            trialsExpiringSoon.Count,
            EmailConstants.TrialExpirationWarningDays);

        foreach (var subscription in trialsExpiringSoon)
        {
            // Skip subscriptions for businesses that no longer exist (orphaned data)
            if (subscription.Business == null || subscription.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping trial expiration warning for subscription {SubscriptionId} - business {BusinessId} not found or deleted",
                    subscription.Id,
                    subscription.BusinessId);
                continue;
            }

            _logger.LogWarning(
                "Trial for business {BusinessId} ({BusinessName}) expires in {Days} days on {ExpiryDate}",
                subscription.BusinessId,
                subscription.Business.Name,
                EmailConstants.TrialExpirationWarningDays,
                subscription.TrialEnd);

            // Send trial expiring notification (email + in-app)
            try
            {
                // Email notification
                await _emailService.SendTrialExpiringNotificationAsync(
                    subscription.BusinessId,
                    EmailConstants.TrialExpirationWarningDays,
                    CancellationToken.None);

                // In-app notification
                await _notificationService.NotifyTrialExpiringAsync(
                    subscription.BusinessId,
                    EmailConstants.TrialExpirationWarningDays,
                    CancellationToken.None);

                _logger.LogInformation(
                    "Sent trial expiring notification to business {BusinessId}",
                    subscription.BusinessId);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send trial expiring notification to business {BusinessId}",
                    subscription.BusinessId);
            }
        }

        // Find expired trials (for status update)
        // Include Business to check for orphaned subscriptions
        var expiredTrials = await _context.Set<Domain.Entities.Subscription>()
            .Include(s => s.Business)
            .Where(s => s.Status == SubscriptionStatus.Trial &&
                       s.TrialEnd.HasValue &&
                       s.TrialEnd.Value.Date < today)
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} expired trials",
            expiredTrials.Count);

        foreach (var subscription in expiredTrials)
        {
            // Skip subscriptions for businesses that no longer exist (orphaned data)
            if (subscription.Business == null || subscription.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping expired trial processing for subscription {SubscriptionId} - business {BusinessId} not found or deleted",
                    subscription.Id,
                    subscription.BusinessId);
                continue;
            }

            subscription.Status = SubscriptionStatus.Expired;

            // Send trial expired in-app notification
            try
            {
                await _notificationService.NotifyTrialExpiredAsync(
                    subscription.BusinessId,
                    CancellationToken.None);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send trial expired notification to business {BusinessId}",
                    subscription.BusinessId);
            }

            _logger.LogWarning(
                "Marked trial as expired for business {BusinessId}",
                subscription.BusinessId);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Trial expiration check job completed. Warned {WarningCount}, Expired {ExpiredCount}",
            trialsExpiringSoon.Count,
            expiredTrials.Count);
    }
}

