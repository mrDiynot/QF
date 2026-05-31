namespace QualiFlow.Infrastructure.ExternalServices.TwilioIntegration;

/// <summary>
/// Retry policy configuration for external API calls.
/// </summary>
public class RetryPolicyOptions
{
    /// <summary>
    /// Gets or sets the maximum number of retry attempts.
    /// Default: 3.
    /// </summary>
    public int MaxRetryAttempts { get; set; } = 3;

    /// <summary>
    /// Gets or sets the initial delay in milliseconds before the first retry.
    /// Default: 1000ms (1 second).
    /// </summary>
    public int InitialDelayMs { get; set; } = 1000;

    /// <summary>
    /// Gets or sets the timeout in seconds for API calls.
    /// Default: 30 seconds.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;
}
