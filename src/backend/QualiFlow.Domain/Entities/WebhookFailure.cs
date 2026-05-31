using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a failed webhook that needs to be retried or investigated.
/// Acts as a dead-letter queue for webhook processing failures.
/// </summary>
public class WebhookFailure : BaseEntity
{
    /// <summary>
    /// Gets or sets the webhook source (e.g., "meta", "twilio").
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the raw webhook payload.
    /// </summary>
    public string Payload { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the error message from the failed processing attempt.
    /// </summary>
    public string ErrorMessage { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the stack trace from the exception.
    /// </summary>
    public string? StackTrace { get; set; }

    /// <summary>
    /// Gets or sets the number of retry attempts.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of retries allowed.
    /// </summary>
    public int MaxRetries { get; set; } = 5;

    /// <summary>
    /// Gets or sets the next scheduled retry time.
    /// </summary>
    public DateTime? NextRetryAt { get; set; }

    /// <summary>
    /// Gets or sets the status of the webhook failure.
    /// </summary>
    public WebhookFailureStatus Status { get; set; } = WebhookFailureStatus.Pending;

    /// <summary>
    /// Gets or sets when the webhook was successfully processed (if retried).
    /// </summary>
    public DateTime? ProcessedAt { get; set; }

    /// <summary>
    /// Gets or sets additional context data as JSON.
    /// </summary>
    public string? ContextJson { get; set; }
}

