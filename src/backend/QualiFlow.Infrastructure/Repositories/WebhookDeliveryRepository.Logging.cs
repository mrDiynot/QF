using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for WebhookDeliveryRepository.
/// </summary>
public partial class WebhookDeliveryRepository
{
    [LoggerMessage(
        EventId = 8101,
        Level = LogLevel.Information,
        Message = "Getting webhook delivery {DeliveryId} for business {BusinessId}")]
    private static partial void LogGettingDelivery(ILogger logger, Guid deliveryId, Guid businessId);

    [LoggerMessage(
        EventId = 8102,
        Level = LogLevel.Information,
        Message = "Getting deliveries for webhook {WebhookId} in business {BusinessId} (skip: {Skip}, take: {Take})")]
    private static partial void LogGettingDeliveriesByWebhook(
        ILogger logger,
        Guid webhookId,
        Guid businessId,
        int skip,
        int take);

    [LoggerMessage(
        EventId = 8103,
        Level = LogLevel.Information,
        Message = "Getting pending retries for business {BusinessId}")]
    private static partial void LogGettingPendingRetries(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 8107,
        Level = LogLevel.Information,
        Message = "Getting pending retries for system job (all businesses)")]
    private static partial void LogGettingPendingRetriesSystemJob(ILogger logger);

    [LoggerMessage(
        EventId = 8104,
        Level = LogLevel.Information,
        Message = "Adding delivery {DeliveryId} for webhook {WebhookId}")]
    private static partial void LogAddingDelivery(ILogger logger, Guid deliveryId, Guid webhookId);

    [LoggerMessage(
        EventId = 8105,
        Level = LogLevel.Information,
        Message = "Updating delivery {DeliveryId} for webhook {WebhookId}")]
    private static partial void LogUpdatingDelivery(ILogger logger, Guid deliveryId, Guid webhookId);

    [LoggerMessage(
        EventId = 8106,
        Level = LogLevel.Information,
        Message = "Getting delivery count for webhook {WebhookId} in business {BusinessId}")]
    private static partial void LogGettingDeliveryCount(ILogger logger, Guid webhookId, Guid businessId);
}

