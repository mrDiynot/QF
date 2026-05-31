using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Webhooks.Services;

/// <summary>
/// Logging partial class for WebhookService.
/// </summary>
public partial class WebhookService
{
    [LoggerMessage(
        EventId = 9001,
        Level = LogLevel.Information,
        Message = "Creating webhook for business {BusinessId}")]
    private static partial void LogCreatingWebhook(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 9002,
        Level = LogLevel.Information,
        Message = "Webhook {WebhookId} created for business {BusinessId}")]
    private static partial void LogWebhookCreated(ILogger logger, Guid webhookId, Guid businessId);

    [LoggerMessage(
        EventId = 9003,
        Level = LogLevel.Information,
        Message = "Webhook {WebhookId} updated")]
    private static partial void LogWebhookUpdated(ILogger logger, Guid webhookId);

    [LoggerMessage(
        EventId = 9004,
        Level = LogLevel.Information,
        Message = "Webhook {WebhookId} deleted")]
    private static partial void LogWebhookDeleted(ILogger logger, Guid webhookId);

    [LoggerMessage(
        EventId = 9005,
        Level = LogLevel.Information,
        Message = "Delivering event {EventType} to {WebhookCount} webhooks")]
    private static partial void LogDeliveringEvent(ILogger logger, string eventType, int webhookCount);

    [LoggerMessage(
        EventId = 9006,
        Level = LogLevel.Information,
        Message = "Delivery {DeliveryId} for webhook {WebhookId} succeeded in {DurationMs}ms")]
    private static partial void LogDeliverySuccess(ILogger logger, Guid deliveryId, Guid webhookId, int durationMs);

    [LoggerMessage(
        EventId = 9007,
        Level = LogLevel.Warning,
        Message = "Delivery {DeliveryId} for webhook {WebhookId} failed with HTTP {StatusCode}")]
    private static partial void LogDeliveryFailed(ILogger logger, Guid deliveryId, Guid webhookId, int statusCode);

    [LoggerMessage(
        EventId = 9008,
        Level = LogLevel.Error,
        Message = "Delivery {DeliveryId} for webhook {WebhookId} threw exception")]
    private static partial void LogDeliveryException(ILogger logger, Guid deliveryId, Guid webhookId, Exception exception);

    [LoggerMessage(
        EventId = 9009,
        Level = LogLevel.Warning,
        Message = "Webhook {WebhookId} not found for retry of delivery {DeliveryId}")]
    private static partial void LogWebhookNotFoundForRetry(ILogger logger, Guid webhookId, Guid deliveryId);

    [LoggerMessage(
        EventId = 9010,
        Level = LogLevel.Information,
        Message = "Webhook {WebhookId} is not active (Status: {Status}). Skipping retry for delivery {DeliveryId}")]
    private static partial void LogWebhookNotActiveForRetry(ILogger logger, Guid webhookId, WebhookStatus status, Guid deliveryId);
}

