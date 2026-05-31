using System.Text;
using System.Text.Json;

using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Webhooks.DTOs;
using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Webhooks.Services;

/// <summary>
/// Service implementation for webhook business logic operations.
/// </summary>
public partial class WebhookService : IWebhookService
{
    private readonly IWebhookRepository _webhookRepository;
    private readonly IWebhookDeliveryRepository _deliveryRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<WebhookService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebhookService"/> class.
    /// </summary>
    /// <param name="webhookRepository">The webhook repository.</param>
    /// <param name="deliveryRepository">The webhook delivery repository.</param>
    /// <param name="currentUserService">The current user service.</param>
    /// <param name="httpClientFactory">The HTTP client factory.</param>
    /// <param name="logger">The logger.</param>
    public WebhookService(
        IWebhookRepository webhookRepository,
        IWebhookDeliveryRepository deliveryRepository,
        ICurrentUserService currentUserService,
        IHttpClientFactory httpClientFactory,
        ILogger<WebhookService> logger)
    {
        _webhookRepository = webhookRepository;
        _deliveryRepository = deliveryRepository;
        _currentUserService = currentUserService;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<WebhookResponse?> GetByIdAsync(Guid webhookId, CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookRepository.GetByIdAsync(webhookId, cancellationToken);
        return webhook == null ? null : MapToResponse(webhook);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<WebhookResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var webhooks = await _webhookRepository.GetAllAsync(cancellationToken);
        return webhooks.Select(MapToResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<WebhookResponse> CreateAsync(CreateWebhookRequest request, CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        LogCreatingWebhook(_logger, businessId);

        // Generate secret for HMAC signature using the verifier
        var secret = WebhookSignatureVerifier.GenerateSecret();

        var webhook = new Webhook
        {
            BusinessId = businessId,
            Url = request.Url,
            Events = request.Events.ToList(),
            Secret = secret,
            Status = WebhookStatus.Active,
            Description = request.Description,
            ConsecutiveFailures = 0,
        };

        await _webhookRepository.AddAsync(webhook, cancellationToken);
        LogWebhookCreated(_logger, webhook.Id, businessId);

        return MapToResponse(webhook);
    }

    /// <inheritdoc />
    public async Task<WebhookResponse?> UpdateAsync(
        Guid webhookId,
        UpdateWebhookRequest request,
        CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookRepository.GetByIdAsync(webhookId, cancellationToken);
        if (webhook == null)
        {
            return null;
        }

        if (request.Url != null)
        {
            webhook.Url = request.Url;
        }

        if (request.Events != null)
        {
            webhook.Events.Clear();
            foreach (var eventType in request.Events)
            {
                webhook.Events.Add(eventType);
            }
        }

        if (request.Status.HasValue)
        {
            webhook.Status = request.Status.Value;
        }

        if (request.Description != null)
        {
            webhook.Description = request.Description;
        }

        await _webhookRepository.UpdateAsync(webhook, cancellationToken);
        LogWebhookUpdated(_logger, webhookId);

        return MapToResponse(webhook);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(Guid webhookId, CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookRepository.GetByIdAsync(webhookId, cancellationToken);
        if (webhook == null)
        {
            return false;
        }

        await _webhookRepository.DeleteAsync(webhook, cancellationToken);
        LogWebhookDeleted(_logger, webhookId);

        return true;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<WebhookDeliveryResponse>> GetDeliveryLogsAsync(
        Guid webhookId,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default)
    {
        var deliveries = await _deliveryRepository.GetByWebhookIdAsync(webhookId, skip, take, cancellationToken);
        return deliveries.Select(MapToDeliveryResponse).ToList();
    }

    /// <inheritdoc />
    public async Task<WebhookDeliveryResponse?> RetryDeliveryAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default)
    {
        var delivery = await _deliveryRepository.GetByIdAsync(deliveryId, cancellationToken);
        if (delivery == null)
        {
            return null;
        }

        var webhook = await _webhookRepository.GetByIdAsync(delivery.WebhookId, cancellationToken);
        if (webhook == null)
        {
            LogWebhookNotFoundForRetry(_logger, delivery.WebhookId, deliveryId);
            return null;
        }

        // Check if webhook is still active
        if (webhook.Status != WebhookStatus.Active)
        {
            LogWebhookNotActiveForRetry(_logger, webhook.Id, webhook.Status, deliveryId);
            return MapToDeliveryResponse(delivery);
        }

        // Retry the delivery
        return await DeliverToWebhookAsync(webhook, delivery.EventType, delivery.Payload, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<WebhookDeliveryResponse> TestAsync(Guid webhookId, CancellationToken cancellationToken = default)
    {
        var webhook = await _webhookRepository.GetByIdAsync(webhookId, cancellationToken)
            ?? throw new InvalidOperationException($"Webhook {webhookId} not found.");

        var testPayload = JsonSerializer.Serialize(new { test = true, timestamp = DateTime.UtcNow });
        return await DeliverToWebhookAsync(webhook, "webhook.test", testPayload, cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeliverEventAsync(string eventType, string payload, CancellationToken cancellationToken = default)
    {
        var webhooks = await _webhookRepository.GetByEventTypeAsync(eventType, cancellationToken);
        LogDeliveringEvent(_logger, eventType, webhooks.Count);

        // Deliver to all webhooks in parallel but await completion to avoid
        // ObjectDisposedException from scoped services being disposed after request ends.
        var deliveryTasks = webhooks.Select(webhook =>
            DeliverToWebhookAsync(webhook, eventType, payload, cancellationToken));

        await Task.WhenAll(deliveryTasks);
    }

    private static DateTime CalculateNextRetry(int attempts) => attempts switch
    {
        1 => DateTime.UtcNow.AddMinutes(1),
        2 => DateTime.UtcNow.AddMinutes(5),
        3 => DateTime.UtcNow.AddMinutes(30),
        4 => DateTime.UtcNow.AddHours(2),
        _ => DateTime.UtcNow.AddHours(12),
    };

    private static WebhookResponse MapToResponse(Webhook webhook) => new()
    {
        Id = webhook.Id,
        Url = webhook.Url,
        Events = webhook.Events,
        Status = webhook.Status,
        Description = webhook.Description,
        ConsecutiveFailures = webhook.ConsecutiveFailures,
        LastSuccessAt = webhook.LastSuccessAt,
        LastFailureAt = webhook.LastFailureAt,
        CreatedAt = webhook.CreatedAt,
        UpdatedAt = webhook.UpdatedAt,
    };

    private static WebhookDeliveryResponse MapToDeliveryResponse(WebhookDelivery delivery) => new()
    {
        Id = delivery.Id,
        WebhookId = delivery.WebhookId,
        EventType = delivery.EventType,
        Status = delivery.Status,
        Attempts = delivery.Attempts,
        NextRetryAt = delivery.NextRetryAt,
        ResponseCode = delivery.ResponseCode,
        ErrorMessage = delivery.ErrorMessage,
        DurationMs = delivery.DurationMs,
        CompletedAt = delivery.CompletedAt,
        CreatedAt = delivery.CreatedAt,
    };

    private async Task<WebhookDeliveryResponse> DeliverToWebhookAsync(
        Webhook webhook,
        string eventType,
        string payload,
        CancellationToken cancellationToken)
    {
        var delivery = new WebhookDelivery
        {
            WebhookId = webhook.Id,
            EventType = eventType,
            Payload = payload,
            Status = WebhookDeliveryStatus.Pending,
            Attempts = 0,
        };

        await _deliveryRepository.AddAsync(delivery, cancellationToken);

        try
        {
            await SendWebhookRequestAsync(webhook, eventType, payload, delivery, cancellationToken);
        }
        catch (Exception ex)
        {
            delivery.Status = delivery.Attempts >= 5 ? WebhookDeliveryStatus.FailedPermanently : WebhookDeliveryStatus.Failed;
            delivery.ErrorMessage = ex.Message;
            delivery.NextRetryAt = delivery.Attempts < 5 ? CalculateNextRetry(delivery.Attempts) : null;
            delivery.CompletedAt = DateTime.UtcNow;
            await _webhookRepository.IncrementFailureCountAsync(webhook.Id, cancellationToken);
            LogDeliveryException(_logger, delivery.Id, webhook.Id, ex);
        }

        await _deliveryRepository.UpdateAsync(delivery, cancellationToken);
        return MapToDeliveryResponse(delivery);
    }

    private async Task SendWebhookRequestAsync(
        Webhook webhook,
        string eventType,
        string payload,
        WebhookDelivery delivery,
        CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;
        var httpClient = _httpClientFactory.CreateClient("WebhookClient");

        using var request = new HttpRequestMessage(HttpMethod.Post, webhook.Url)
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json"),
        };

        var signature = WebhookSignatureVerifier.GenerateSignature(payload, webhook.Secret);
        request.Headers.Add("X-Webhook-Signature", signature);
        request.Headers.Add("X-Webhook-Event", eventType);

        delivery.Attempts++;
        var response = await httpClient.SendAsync(request, cancellationToken);
        var duration = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

        delivery.ResponseCode = (int)response.StatusCode;
        delivery.DurationMs = duration;
        delivery.CompletedAt = DateTime.UtcNow;

        if (response.IsSuccessStatusCode)
        {
            delivery.Status = WebhookDeliveryStatus.Success;
            await _webhookRepository.ResetFailureCountAsync(webhook.Id, cancellationToken);
            LogDeliverySuccess(_logger, delivery.Id, webhook.Id, duration);
        }
        else
        {
            delivery.Status = WebhookDeliveryStatus.Failed;
            delivery.ErrorMessage = $"HTTP {response.StatusCode}";
            delivery.NextRetryAt = CalculateNextRetry(delivery.Attempts);
            await _webhookRepository.IncrementFailureCountAsync(webhook.Id, cancellationToken);
            LogDeliveryFailed(_logger, delivery.Id, webhook.Id, (int)response.StatusCode);
        }
    }
}

