using Microsoft.Extensions.Logging;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Logging partial class for WebhookRepository.
/// </summary>
public partial class WebhookRepository
{
    [LoggerMessage(
        EventId = 8001,
        Level = LogLevel.Information,
        Message = "Getting webhook {WebhookId} for business {BusinessId}")]
    private static partial void LogGettingWebhook(ILogger logger, Guid webhookId, Guid businessId);

    [LoggerMessage(
        EventId = 8002,
        Level = LogLevel.Information,
        Message = "Getting all webhooks for business {BusinessId}")]
    private static partial void LogGettingAllWebhooks(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 8003,
        Level = LogLevel.Information,
        Message = "Getting active webhooks for business {BusinessId}")]
    private static partial void LogGettingActiveWebhooks(ILogger logger, Guid businessId);

    [LoggerMessage(
        EventId = 8004,
        Level = LogLevel.Information,
        Message = "Getting webhooks for event {EventType} in business {BusinessId}")]
    private static partial void LogGettingWebhooksByEvent(ILogger logger, string eventType, Guid businessId);

    [LoggerMessage(
        EventId = 8005,
        Level = LogLevel.Information,
        Message = "Adding webhook {WebhookId} for business {BusinessId}")]
    private static partial void LogAddingWebhook(ILogger logger, Guid webhookId, Guid businessId);

    [LoggerMessage(
        EventId = 8006,
        Level = LogLevel.Information,
        Message = "Updating webhook {WebhookId} for business {BusinessId}")]
    private static partial void LogUpdatingWebhook(ILogger logger, Guid webhookId, Guid businessId);

    [LoggerMessage(
        EventId = 8007,
        Level = LogLevel.Information,
        Message = "Deleting webhook {WebhookId} for business {BusinessId}")]
    private static partial void LogDeletingWebhook(ILogger logger, Guid webhookId, Guid businessId);

    [LoggerMessage(
        EventId = 8008,
        Level = LogLevel.Warning,
        Message = "Webhook {WebhookId} auto-disabled after {FailureCount} consecutive failures")]
    private static partial void LogWebhookAutoDisabled(ILogger logger, Guid webhookId, int failureCount);
}

