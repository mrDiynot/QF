using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Webhooks.Services;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to retry failed webhook deliveries based on exponential backoff schedule.
/// Runs every 1 minute to check for deliveries ready for retry.
/// </summary>
public class WebhookRetryJob
{
    private readonly IWebhookDeliveryRepository _deliveryRepository;
    private readonly IWebhookService _webhookService;
    private readonly ILogger<WebhookRetryJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebhookRetryJob"/> class.
    /// </summary>
    public WebhookRetryJob(
        IWebhookDeliveryRepository deliveryRepository,
        IWebhookService webhookService,
        ILogger<WebhookRetryJob> logger)
    {
        _deliveryRepository = deliveryRepository;
        _webhookService = webhookService;
        _logger = logger;
    }

    /// <summary>
    /// Executes the webhook retry job.
    /// Finds all failed deliveries ready for retry and attempts to deliver them.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting webhook retry job");

        try
        {
            // Get all deliveries ready for retry (NextRetryAt <= now, Attempts < 5, Status = Failed)
            var pendingRetries = await _deliveryRepository.GetPendingRetriesAsync(CancellationToken.None);

            _logger.LogInformation(
                "Found {Count} webhook deliveries ready for retry",
                pendingRetries.Count);

            if (pendingRetries.Count == 0)
            {
                return;
            }

            // Process each delivery
            foreach (var delivery in pendingRetries)
            {
                try
                {
                    _logger.LogInformation(
                        "Retrying webhook delivery {DeliveryId} for webhook {WebhookId} (Attempt {Attempt}/5)",
                        delivery.Id,
                        delivery.WebhookId,
                        delivery.Attempts + 1);

                    // Retry the delivery using the webhook service
                    // The service will handle updating the delivery status, attempts, and next retry time
                    var result = await _webhookService.RetryDeliveryAsync(delivery.Id, CancellationToken.None);

                    if (result != null)
                    {
                        _logger.LogInformation(
                            "Successfully retried webhook delivery {DeliveryId}. Status: {Status}",
                            delivery.Id,
                            result.Status);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error retrying webhook delivery {DeliveryId} for webhook {WebhookId}",
                        delivery.Id,
                        delivery.WebhookId);
                }
            }

            _logger.LogInformation(
                "Webhook retry job completed. Processed {Count} deliveries",
                pendingRetries.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing webhook retry job");
            throw;
        }
    }
}

