using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for WebhookDelivery entity operations.
/// All operations are automatically scoped to the current user's business (tenant) via global query filters.
/// Multi-tenancy is enforced at the EF Core level through the Webhook relationship.
/// </summary>
public interface IWebhookDeliveryRepository
{
    /// <summary>
    /// Gets a webhook delivery by ID.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="deliveryId">The delivery ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The delivery if found; otherwise, null.</returns>
    Task<WebhookDelivery?> GetByIdAsync(Guid deliveryId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deliveries for a specific webhook with pagination.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="skip">Number of records to skip for pagination.</param>
    /// <param name="take">Number of records to take for pagination.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhook deliveries.</returns>
    Task<IReadOnlyList<WebhookDelivery>> GetByWebhookIdAsync(
        Guid webhookId,
        int skip = 0,
        int take = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all pending deliveries that are ready for retry.
    /// Returns deliveries where Status = Failed AND NextRetryAt &lt;= UtcNow.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of deliveries ready for retry.</returns>
    Task<IReadOnlyList<WebhookDelivery>> GetPendingRetriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new webhook delivery.
    /// </summary>
    /// <param name="delivery">The delivery to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(WebhookDelivery delivery, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing webhook delivery.
    /// </summary>
    /// <param name="delivery">The delivery to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(WebhookDelivery delivery, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total count of deliveries for a webhook.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total count of deliveries.</returns>
    Task<int> GetDeliveryCountAsync(Guid webhookId, CancellationToken cancellationToken = default);
}

