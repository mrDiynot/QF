using QualiFlow.Application.Features.Webhooks.DTOs;

namespace QualiFlow.Application.Features.Webhooks.Services;

/// <summary>
/// Service interface for webhook business logic operations.
/// All operations are scoped to the current user's business (tenant) for multi-tenancy isolation.
/// </summary>
public interface IWebhookService
{
    /// <summary>
    /// Gets a webhook by ID.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The webhook if found; otherwise, null.</returns>
    Task<WebhookResponse?> GetByIdAsync(Guid webhookId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all webhooks for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhooks.</returns>
    Task<IReadOnlyList<WebhookResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new webhook.
    /// </summary>
    /// <param name="request">The webhook creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created webhook.</returns>
    Task<WebhookResponse> CreateAsync(CreateWebhookRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing webhook.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="request">The webhook update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated webhook if found; otherwise, null.</returns>
    Task<WebhookResponse?> UpdateAsync(Guid webhookId, UpdateWebhookRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a webhook.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted; false if not found.</returns>
    Task<bool> DeleteAsync(Guid webhookId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Tests a webhook by sending a test payload.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The test delivery result.</returns>
    Task<WebhookDeliveryResponse> TestAsync(Guid webhookId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delivers a webhook event to all subscribed webhooks.
    /// This is called internally when events occur (e.g., lead.created).
    /// </summary>
    /// <param name="eventType">The event type (e.g., "lead.created").</param>
    /// <param name="payload">The event payload as JSON.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeliverEventAsync(string eventType, string payload, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets delivery logs for a webhook with pagination.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="skip">Number of records to skip.</param>
    /// <param name="take">Number of records to take.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of delivery logs.</returns>
    Task<IReadOnlyList<WebhookDeliveryResponse>> GetDeliveryLogsAsync(
        Guid webhookId,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retries a failed webhook delivery.
    /// Used by the WebhookRetryJob background job.
    /// </summary>
    /// <param name="deliveryId">The delivery ID to retry.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated webhook delivery response.</returns>
    Task<WebhookDeliveryResponse?> RetryDeliveryAsync(
        Guid deliveryId,
        CancellationToken cancellationToken = default);
}

