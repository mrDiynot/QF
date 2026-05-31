using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job that retries failed message deliveries with exponential backoff (Sprint 2.3).
/// Runs every 5 minutes to find and retry failed messages.
/// </summary>
public class MessageDeliveryRetryJob
{
    // Retry configuration
    private const int MaxRetryAttempts = 5;
    private static readonly TimeSpan[] RetryDelays = new[]
    {
        TimeSpan.FromMinutes(1),   // 1st retry: 1 minute
        TimeSpan.FromMinutes(5),   // 2nd retry: 5 minutes
        TimeSpan.FromMinutes(15),  // 3rd retry: 15 minutes
        TimeSpan.FromHours(1),     // 4th retry: 1 hour
        TimeSpan.FromHours(6),     // 5th retry: 6 hours
    };

    private readonly QualiFlowDbContext _context;
    private readonly ILogger<MessageDeliveryRetryJob> _logger;

    public MessageDeliveryRetryJob(
        QualiFlowDbContext context,
        ILogger<MessageDeliveryRetryJob> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Processes failed messages and retries delivery with exponential backoff.
    /// This method is called by Hangfire every 5 minutes.
    /// Note: AutomaticRetry attribute is not applied because we handle message retries internally.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting message delivery retry job");

        try
        {
            var now = DateTime.UtcNow;

            // Find failed messages that are due for retry
            // Include Conversation.Business to skip orphaned messages
            var messagesToRetry = await _context.Messages
                .Include(m => m.Conversation)
                    .ThenInclude(c => c.Business)
                .Where(m =>
                    m.DeliveryStatus == DeliveryStatus.Failed &&
                    m.RetryCount < MaxRetryAttempts &&
                    (m.LastRetryAt == null || m.LastRetryAt < now))
                .OrderBy(m => m.LastRetryAt ?? m.SentAt) // Oldest failures first
                .Take(100) // Process in batches to avoid overload
                .ToListAsync(cancellationToken);

            if (messagesToRetry.Count == 0)
            {
                _logger.LogInformation("No messages to retry");
                return;
            }

            _logger.LogInformation("Found {Count} messages to retry", messagesToRetry.Count);

            var retried = 0;
            var permanentlyFailed = 0;

            foreach (var message in messagesToRetry)
            {
                // Skip messages for businesses that no longer exist (orphaned data)
                if (message.Conversation?.Business == null || message.Conversation.Business.DeletedAt != null)
                {
                    _logger.LogWarning(
                        "Skipping message retry for message {MessageId} - business not found or deleted",
                        message.Id);
                    continue;
                }

                // Check if enough time has passed for retry (exponential backoff)
                if (!IsReadyForRetry(message, now))
                {
                    continue;
                }

                // Check if max retries reached
                if (message.RetryCount >= MaxRetryAttempts)
                {
                    message.DeliveryStatus = DeliveryStatus.FailedPermanently;
                    message.FailureReason = $"Max retry attempts ({MaxRetryAttempts}) exceeded. Last failure: {message.FailureReason}";
                    message.UpdatedAt = now;
                    permanentlyFailed++;
                    _logger.LogWarning(
                        "Message {MessageId} failed permanently after {RetryCount} attempts",
                        message.Id,
                        message.RetryCount);
                    continue;
                }

                // Attempt retry
                try
                {
                    // Queue message for retry (actual sending happens in message service)
                    // For now, we just update status and increment retry count
                    // The actual sending logic would be triggered by a message queue/service
                    message.DeliveryStatus = DeliveryStatus.Queued; // Back to queued for retry
                    message.RetryCount++;
                    message.LastRetryAt = now;
                    message.UpdatedAt = now;
                    retried++;

                    _logger.LogInformation(
                        "Queued message {MessageId} for retry attempt {RetryCount}",
                        message.Id,
                        message.RetryCount);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error queuing message {MessageId} for retry",
                        message.Id);
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Message retry job completed. Retried: {Retried}, Permanently Failed: {PermanentlyFailed}",
                retried,
                permanentlyFailed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in message delivery retry job");
            throw; // Let Hangfire handle job failure
        }
    }

    /// <summary>
    /// Determines if a message is ready for retry based on exponential backoff.
    /// </summary>
    private static bool IsReadyForRetry(Domain.Entities.Message message, DateTime now)
    {
        // If never retried, ready now
        if (!message.LastRetryAt.HasValue)
        {
            return true;
        }

        // Get the delay for this retry attempt (exponential backoff)
        var retryIndex = Math.Min(message.RetryCount, RetryDelays.Length - 1);
        var requiredDelay = RetryDelays[retryIndex];

        // Check if enough time has passed since last retry
        var timeSinceLastRetry = now - message.LastRetryAt.Value;
        return timeSinceLastRetry >= requiredDelay;
    }

    /// <summary>
    /// Registers the recurring job with Hangfire.
    /// Should be called during application startup.
    /// </summary>
    public static void RegisterRecurringJob()
    {
        // Run every 5 minutes
        RecurringJob.AddOrUpdate<MessageDeliveryRetryJob>(
            "message-delivery-retry",
            job => job.ExecuteAsync(CancellationToken.None),
            "*/5 * * * *"); // Cron: every 5 minutes
    }
}
