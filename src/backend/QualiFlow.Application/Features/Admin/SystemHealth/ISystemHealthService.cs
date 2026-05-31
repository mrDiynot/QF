// -----------------------------------------------------------------------
// <copyright file="ISystemHealthService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Admin.SystemHealth;

/// <summary>
/// Service interface for system health monitoring.
/// </summary>
public interface ISystemHealthService
{
    /// <summary>
    /// Gets the overall system health status.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>System health status.</returns>
    Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets background job statistics from Hangfire.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Job statistics.</returns>
    Task<JobStatisticsDto> GetJobStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets external service usage statistics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>External service usage.</returns>
    Task<ExternalServiceUsageDto> GetExternalServiceUsageAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Verifies that database seed data matches expected values.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Seed data verification results.</returns>
    Task<SeedDataVerificationDto> VerifySeedDataAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets Meta (Instagram/Facebook) integration health status.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Meta integration health status.</returns>
    Task<MetaIntegrationHealthDto> GetMetaIntegrationHealthAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for system health status.
/// </summary>
public class SystemHealthDto
{
    /// <summary>Gets the overall status.</summary>
    public string OverallStatus { get; init; } = "healthy";

    /// <summary>Gets the uptime.</summary>
    public TimeSpan Uptime { get; init; }

    /// <summary>Gets the uptime formatted string.</summary>
    public string UptimeFormatted { get; init; } = string.Empty;

    /// <summary>Gets the service statuses.</summary>
    public IReadOnlyList<ServiceStatusDto> Services { get; init; } = [];

    /// <summary>Gets the last check time.</summary>
    public DateTime LastChecked { get; init; }
}

/// <summary>
/// DTO for individual service status.
/// </summary>
public class ServiceStatusDto
{
    /// <summary>Gets the service name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets the status.</summary>
    public string Status { get; init; } = "healthy";

    /// <summary>Gets the latency in milliseconds.</summary>
    public int? LatencyMs { get; init; }

    /// <summary>Gets the last check time.</summary>
    public DateTime LastChecked { get; init; }

    /// <summary>Gets additional details.</summary>
    public string? Details { get; init; }
}

/// <summary>
/// DTO for background job statistics.
/// </summary>
public class JobStatisticsDto
{
    /// <summary>Gets queued jobs.</summary>
    public long Queued { get; init; }

    /// <summary>Gets processing jobs.</summary>
    public long Processing { get; init; }

    /// <summary>Gets succeeded jobs.</summary>
    public long Succeeded { get; init; }

    /// <summary>Gets failed jobs.</summary>
    public long Failed { get; init; }

    /// <summary>Gets scheduled jobs.</summary>
    public long Scheduled { get; init; }

    /// <summary>Gets recurring jobs.</summary>
    public long Recurring { get; init; }

    /// <summary>Gets the servers count.</summary>
    public int Servers { get; init; }
}

/// <summary>
/// DTO for external service usage.
/// </summary>
public class ExternalServiceUsageDto
{
    /// <summary>Gets Twilio usage.</summary>
    public TwilioUsageDto Twilio { get; init; } = new();

    /// <summary>Gets OpenAI usage.</summary>
    public OpenAIUsageDto OpenAI { get; init; } = new();

    /// <summary>Gets Stripe usage.</summary>
    public StripeUsageDto Stripe { get; init; } = new();
}

/// <summary>
/// DTO for Twilio usage.
/// </summary>
public class TwilioUsageDto
{
    /// <summary>Gets SMS count this month.</summary>
    public int SmsCount { get; init; }

    /// <summary>Gets voice minutes this month.</summary>
    public int VoiceMinutes { get; init; }

    /// <summary>Gets estimated cost.</summary>
    public decimal EstimatedCost { get; init; }
}

/// <summary>
/// DTO for OpenAI usage.
/// </summary>
public class OpenAIUsageDto
{
    /// <summary>Gets tokens used this month.</summary>
    public long TokensUsed { get; init; }

    /// <summary>Gets request count this month.</summary>
    public int RequestCount { get; init; }

    /// <summary>Gets estimated cost.</summary>
    public decimal EstimatedCost { get; init; }
}

/// <summary>
/// DTO for Stripe usage.
/// </summary>
public class StripeUsageDto
{
    /// <summary>Gets transaction count this month.</summary>
    public int TransactionCount { get; init; }

    /// <summary>Gets transaction volume this month.</summary>
    public decimal TransactionVolume { get; init; }

    /// <summary>Gets estimated fees.</summary>
    public decimal EstimatedFees { get; init; }
}

/// <summary>
/// DTO for seed data verification results.
/// </summary>
public class SeedDataVerificationDto
{
    /// <summary>Gets a value indicating whether all seed data is valid.</summary>
    public bool IsValid { get; init; }

    /// <summary>Gets subscription plans verification.</summary>
    public SeedVerificationItemDto SubscriptionPlans { get; init; } = new();

    /// <summary>Gets features verification.</summary>
    public SeedVerificationItemDto Features { get; init; } = new();

    /// <summary>Gets plan features verification.</summary>
    public SeedVerificationItemDto PlanFeatures { get; init; } = new();

    /// <summary>Gets plan limits verification.</summary>
    public SeedVerificationItemDto PlanLimits { get; init; } = new();

    /// <summary>Gets admin users verification.</summary>
    public SeedVerificationItemDto AdminUsers { get; init; } = new();

    /// <summary>Gets any issues found.</summary>
    public IReadOnlyList<string> Issues { get; init; } = [];
}

/// <summary>
/// DTO for individual seed verification item.
/// </summary>
public class SeedVerificationItemDto
{
    /// <summary>Gets a value indicating whether this item is valid.</summary>
    public bool IsValid { get; init; }

    /// <summary>Gets expected count.</summary>
    public int ExpectedCount { get; init; }

    /// <summary>Gets actual count.</summary>
    public int ActualCount { get; init; }

    /// <summary>Gets details about the items.</summary>
    public IReadOnlyList<string> Details { get; init; } = [];

    /// <summary>Gets any missing items.</summary>
    public IReadOnlyList<string> Missing { get; init; } = [];
}

/// <summary>
/// DTO for Meta (Instagram/Facebook) integration health status.
/// </summary>
public class MetaIntegrationHealthDto
{
    /// <summary>Gets the overall status (healthy, warning, critical, unhealthy).</summary>
    public string OverallStatus { get; init; } = "healthy";

    /// <summary>Gets the total number of Meta channels.</summary>
    public int TotalChannels { get; init; }

    /// <summary>Gets the number of active channels.</summary>
    public int ActiveChannels { get; init; }

    /// <summary>Gets the token health status.</summary>
    public MetaTokenHealthDto TokenHealth { get; init; } = new();

    /// <summary>Gets the webhook health status.</summary>
    public MetaWebhookHealthDto WebhookHealth { get; init; } = new();

    /// <summary>Gets the API health status.</summary>
    public MetaApiHealthDto ApiHealth { get; init; } = new();

    /// <summary>Gets the last check time.</summary>
    public DateTime LastChecked { get; init; }

    /// <summary>Gets any issues found.</summary>
    public IReadOnlyList<string> Issues { get; init; } = [];
}

/// <summary>
/// DTO for Meta token health status.
/// </summary>
public class MetaTokenHealthDto
{
    /// <summary>Gets the number of healthy tokens (>14 days until expiry).</summary>
    public int HealthyCount { get; init; }

    /// <summary>Gets the number of tokens expiring soon (7-14 days).</summary>
    public int WarningCount { get; init; }

    /// <summary>Gets the number of tokens expiring very soon (less than 7 days).</summary>
    public int CriticalCount { get; init; }

    /// <summary>Gets the number of expired tokens.</summary>
    public int ExpiredCount { get; init; }

    /// <summary>Gets channels with token issues.</summary>
    public IReadOnlyList<MetaChannelTokenStatusDto> ChannelsWithIssues { get; init; } = [];
}

/// <summary>
/// DTO for individual channel token status.
/// </summary>
public class MetaChannelTokenStatusDto
{
    /// <summary>Gets the channel ID.</summary>
    public Guid ChannelId { get; init; }

    /// <summary>Gets the channel name.</summary>
    public string ChannelName { get; init; } = string.Empty;

    /// <summary>Gets the channel type (Instagram/Facebook).</summary>
    public string ChannelType { get; init; } = string.Empty;

    /// <summary>Gets the business ID.</summary>
    public Guid BusinessId { get; init; }

    /// <summary>Gets the token expiry date.</summary>
    public DateTime? TokenExpiresAt { get; init; }

    /// <summary>Gets the days until expiry (negative if expired).</summary>
    public int? DaysUntilExpiry { get; init; }

    /// <summary>Gets the status (healthy, warning, critical, expired).</summary>
    public string Status { get; init; } = "healthy";
}

/// <summary>
/// DTO for Meta webhook health status.
/// </summary>
public class MetaWebhookHealthDto
{
    /// <summary>Gets the number of pending webhook retries.</summary>
    public int PendingRetries { get; init; }

    /// <summary>Gets the number of failed webhooks (max retries exceeded).</summary>
    public int FailedCount { get; init; }

    /// <summary>Gets the number of webhooks resolved in last 24 hours.</summary>
    public int ResolvedLast24h { get; init; }

    /// <summary>Gets the oldest pending failure timestamp.</summary>
    public DateTime? OldestPending { get; init; }
}

/// <summary>
/// DTO for Meta API health status.
/// </summary>
public class MetaApiHealthDto
{
    /// <summary>Gets a value indicating whether the API is reachable.</summary>
    public bool IsReachable { get; init; }

    /// <summary>Gets the last successful API call time.</summary>
    public DateTime? LastSuccessfulCall { get; init; }

    /// <summary>Gets the current rate limit status.</summary>
    public string RateLimitStatus { get; init; } = "ok";

    /// <summary>Gets the average response time in milliseconds.</summary>
    public int? AverageResponseTimeMs { get; init; }
}
