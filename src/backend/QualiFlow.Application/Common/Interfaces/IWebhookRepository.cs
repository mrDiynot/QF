using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Webhook entity operations.
/// All operations are automatically scoped to the current user's business (tenant) via global query filters.
/// Multi-tenancy is enforced at the EF Core level - no manual BusinessId filtering required.
/// </summary>
public interface IWebhookRepository
{
    /// <summary>
    /// Gets a webhook by ID.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The webhook if found; otherwise, null.</returns>
    Task<Webhook?> GetByIdAsync(Guid webhookId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all webhooks for the current business.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhooks.</returns>
    Task<IReadOnlyList<Webhook>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all active webhooks for the current business.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of active webhooks.</returns>
    Task<IReadOnlyList<Webhook>> GetActiveWebhooksAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all webhooks subscribed to a specific event type.
    /// Automatically filtered by the current user's business context via global query filters.
    /// </summary>
    /// <param name="eventType">The event type (e.g., "lead.created").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of webhooks subscribed to the event.</returns>
    Task<IReadOnlyList<Webhook>> GetByEventTypeAsync(string eventType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new webhook.
    /// </summary>
    /// <param name="webhook">The webhook to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(Webhook webhook, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing webhook.
    /// </summary>
    /// <param name="webhook">The webhook to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Webhook webhook, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a webhook.
    /// </summary>
    /// <param name="webhook">The webhook to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Webhook webhook, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the consecutive failures counter for a webhook.
    /// Auto-disables the webhook if failures exceed threshold (10).
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementFailureCountAsync(Guid webhookId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Resets the consecutive failures counter for a webhook.
    /// Called after a successful delivery.
    /// </summary>
    /// <param name="webhookId">The webhook ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ResetFailureCountAsync(Guid webhookId, CancellationToken cancellationToken = default);
}

