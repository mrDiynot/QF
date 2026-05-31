using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Webhooks.Services;

/// <summary>
/// Service for managing webhook failures and retries.
/// </summary>
public interface IWebhookFailureService
{
    /// <summary>
    /// Records a webhook processing failure for later retry.
    /// </summary>
    /// <param name="source">The webhook source (e.g., "meta", "twilio").</param>
    /// <param name="payload">The raw webhook payload.</param>
    /// <param name="exception">The exception that caused the failure.</param>
    /// <param name="context">Optional context data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created webhook failure record.</returns>
    Task<WebhookFailure> RecordFailureAsync(
        string source,
        string payload,
        Exception exception,
        IDictionary<string, object>? context = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets pending webhook failures that are due for retry.
    /// </summary>
    /// <param name="source">Optional source filter.</param>
    /// <param name="limit">Maximum number of records to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of pending webhook failures.</returns>
    Task<IReadOnlyList<WebhookFailure>> GetPendingRetriesAsync(
        string? source = null,
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a webhook failure as successfully processed.
    /// </summary>
    /// <param name="id">The webhook failure ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task MarkAsResolvedAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the retry count and schedules next retry.
    /// </summary>
    /// <param name="id">The webhook failure ID.</param>
    /// <param name="errorMessage">The error from this retry attempt.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task IncrementRetryAsync(Guid id, string errorMessage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets webhook failure statistics.
    /// </summary>
    /// <param name="source">Optional source filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Statistics about webhook failures.</returns>
    Task<WebhookFailureStats> GetStatsAsync(string? source = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Statistics about webhook failures.
/// </summary>
public record WebhookFailureStats
{
    /// <summary>Gets the count of pending retries.</summary>
    public int PendingCount { get; init; }

    /// <summary>Gets the count of failed (max retries exceeded).</summary>
    public int FailedCount { get; init; }

    /// <summary>Gets the count resolved in last 24 hours.</summary>
    public int ResolvedLast24h { get; init; }

    /// <summary>Gets the oldest pending failure.</summary>
    public DateTime? OldestPending { get; init; }
}

