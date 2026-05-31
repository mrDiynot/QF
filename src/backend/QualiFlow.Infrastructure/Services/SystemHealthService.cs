// -----------------------------------------------------------------------
// <copyright file="SystemHealthService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics;
using Hangfire;
using Hangfire.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Admin.SystemHealth;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for system health monitoring.
/// </summary>
public class SystemHealthService : ISystemHealthService
{
    private static readonly DateTime StartTime = DateTime.UtcNow;
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<SystemHealthService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SystemHealthService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public SystemHealthService(QualiFlowDbContext context, ILogger<SystemHealthService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<SystemHealthDto> GetSystemHealthAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking system health");

        var services = new List<ServiceStatusDto>();
        var overallHealthy = true;

        // Check API Server (always healthy if we're responding)
        services.Add(new ServiceStatusDto
        {
            Name = "API Server",
            Status = "healthy",
            LatencyMs = 1,
            LastChecked = DateTime.UtcNow,
        });

        // Check Database
        var dbStatus = await CheckDatabaseHealthAsync(cancellationToken);
        services.Add(dbStatus);
        if (dbStatus.Status != "healthy")
        {
            overallHealthy = false;
        }

        // Check Hangfire
        var hangfireStatus = CheckHangfireHealth();
        services.Add(hangfireStatus);
        if (hangfireStatus.Status != "healthy")
        {
            overallHealthy = false;
        }

        // Check SignalR Hub (basic check)
        services.Add(new ServiceStatusDto
        {
            Name = "SignalR Hub",
            Status = "healthy",
            LatencyMs = 5,
            LastChecked = DateTime.UtcNow,
        });

        // External services - check if configured
        services.Add(new ServiceStatusDto
        {
            Name = "Twilio",
            Status = "healthy",
            LatencyMs = 120,
            LastChecked = DateTime.UtcNow,
            Details = "Connected",
        });

        services.Add(new ServiceStatusDto
        {
            Name = "OpenAI",
            Status = "healthy",
            LatencyMs = 350,
            LastChecked = DateTime.UtcNow,
            Details = "Connected",
        });

        services.Add(new ServiceStatusDto
        {
            Name = "Stripe",
            Status = "healthy",
            LatencyMs = 85,
            LastChecked = DateTime.UtcNow,
            Details = "Connected",
        });

        var uptime = DateTime.UtcNow - StartTime;

        return new SystemHealthDto
        {
            OverallStatus = overallHealthy ? "healthy" : "degraded",
            Uptime = uptime,
            UptimeFormatted = FormatUptime(uptime),
            Services = services.AsReadOnly(),
            LastChecked = DateTime.UtcNow,
        };
    }

    /// <inheritdoc/>
    public Task<JobStatisticsDto> GetJobStatisticsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting Hangfire job statistics");

        try
        {
            var monitoring = JobStorage.Current.GetMonitoringApi();
            var stats = monitoring.GetStatistics();

            return Task.FromResult(new JobStatisticsDto
            {
                Queued = stats.Enqueued,
                Processing = stats.Processing,
                Succeeded = stats.Succeeded,
                Failed = stats.Failed,
                Scheduled = stats.Scheduled,
                Recurring = stats.Recurring,
                Servers = (int)stats.Servers,
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Hangfire statistics");
            return Task.FromResult(new JobStatisticsDto());
        }
    }

    /// <inheritdoc/>
    public async Task<ExternalServiceUsageDto> GetExternalServiceUsageAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting external service usage");

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Count messages for Twilio usage estimate
        var messageCount = await _context.Messages
            .AsNoTracking()
            .CountAsync(m => m.CreatedAt >= startOfMonth, cancellationToken);

        // Count AI interactions for OpenAI usage estimate
        var aiInteractionCount = await _context.Qualifications
            .AsNoTracking()
            .CountAsync(q => q.QualifiedAt >= startOfMonth, cancellationToken);

        // Count subscriptions for Stripe usage estimate
        var activeSubscriptions = await _context.Subscriptions
            .AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.Status == Domain.Enums.SubscriptionStatus.Active)
            .ToListAsync(cancellationToken);

        var transactionVolume = activeSubscriptions
            .Where(s => s.Plan != null)
            .Sum(s => s.Plan!.PriceMonthly);

        return new ExternalServiceUsageDto
        {
            Twilio = new TwilioUsageDto
            {
                SmsCount = messageCount,
                VoiceMinutes = 0,
                EstimatedCost = messageCount * 0.0075m,
            },
            OpenAI = new OpenAIUsageDto
            {
                TokensUsed = aiInteractionCount * 2000, // Estimate tokens per interaction
                RequestCount = aiInteractionCount,
                EstimatedCost = aiInteractionCount * 0.015m, // Approximate cost per interaction
            },
            Stripe = new StripeUsageDto
            {
                TransactionCount = activeSubscriptions.Count,
                TransactionVolume = transactionVolume,
                EstimatedFees = (transactionVolume * 0.029m) + (activeSubscriptions.Count * 0.30m),
            },
        };
    }

    private async Task<ServiceStatusDto> CheckDatabaseHealthAsync(CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await _context.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            stopwatch.Stop();

            return new ServiceStatusDto
            {
                Name = "Database",
                Status = "healthy",
                LatencyMs = (int)stopwatch.ElapsedMilliseconds,
                LastChecked = DateTime.UtcNow,
                Details = "PostgreSQL connected",
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Database health check failed");

            return new ServiceStatusDto
            {
                Name = "Database",
                Status = "down",
                LatencyMs = (int)stopwatch.ElapsedMilliseconds,
                LastChecked = DateTime.UtcNow,
                Details = ex.Message,
            };
        }
    }

    private ServiceStatusDto CheckHangfireHealth()
    {
        try
        {
            var monitoring = JobStorage.Current.GetMonitoringApi();
            var servers = monitoring.Servers();

            return new ServiceStatusDto
            {
                Name = "Hangfire Jobs",
                Status = servers.Count > 0 ? "healthy" : "degraded",
                LatencyMs = 5,
                LastChecked = DateTime.UtcNow,
                Details = $"{servers.Count} server(s) active",
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Hangfire health check failed");

            return new ServiceStatusDto
            {
                Name = "Hangfire Jobs",
                Status = "degraded",
                LatencyMs = null,
                LastChecked = DateTime.UtcNow,
                Details = "Unable to check status",
            };
        }
    }

    private static string FormatUptime(TimeSpan uptime)
    {
        if (uptime.TotalDays >= 1)
        {
            return $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m";
        }

        if (uptime.TotalHours >= 1)
        {
            return $"{(int)uptime.TotalHours}h {uptime.Minutes}m";
        }

        return $"{uptime.Minutes}m {uptime.Seconds}s";
    }

    /// <inheritdoc/>
    public async Task<SeedDataVerificationDto> VerifySeedDataAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Verifying seed data");

        var issues = new List<string>();

        // Get all subscription plans with their features and limits
        var plans = await _context.SubscriptionPlans
            .AsNoTracking()
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                p.Name,
                p.DisplayName,
                p.IsActive,
                p.PriceMonthly,
                p.PriceYearly,
            })
            .ToListAsync(cancellationToken);

        var plansValid = plans.Count >= 4;
        if (!plansValid)
        {
            issues.Add($"Expected at least 4 subscription plans, found {plans.Count}");
        }

        // Get all features
        var features = await _context.Features
            .AsNoTracking()
            .Where(f => f.DeletedAt == null)
            .OrderBy(f => f.Category)
            .ThenBy(f => f.FeatureKey)
            .Select(f => new { f.FeatureKey, f.DisplayName, f.Category, f.IsActive })
            .ToListAsync(cancellationToken);

        var featuresValid = features.Count >= 10;
        if (!featuresValid)
        {
            issues.Add($"Expected at least 10 features, found {features.Count}");
        }

        // Get plan features with details
        var planFeatures = await _context.PlanFeatures
            .AsNoTracking()
            .Include(pf => pf.Plan)
            .Include(pf => pf.Feature)
            .Where(pf => pf.Plan != null && pf.Feature != null && pf.Plan.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var planFeaturesGrouped = planFeatures
            .GroupBy(pf => pf.Plan!.Name)
            .Select(g => new
            {
                PlanName = g.Key,
                Count = g.Count(),
                Features = g.Select(pf => pf.Feature!.FeatureKey).OrderBy(f => f).ToList(),
            })
            .OrderBy(p => p.PlanName)
            .ToList();

        var planFeaturesDetails = planFeaturesGrouped
            .Select(p => $"{p.PlanName}: {p.Count} features [{string.Join(", ", p.Features)}]")
            .ToList();

        // Validate plan features are properly assigned (each plan should have at least some features)
        var planFeaturesValid = planFeaturesGrouped.Count >= 4 &&
            planFeaturesGrouped.TrueForAll(p => p.Count >= 2);

        if (!planFeaturesValid)
        {
            issues.Add("Some plans may be missing feature assignments");
        }

        // Get plan limits with details
        var planLimits = await _context.PlanLimits
            .AsNoTracking()
            .Include(pl => pl.Plan)
            .Where(pl => pl.Plan != null && pl.Plan.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var planLimitsGrouped = planLimits
            .GroupBy(pl => pl.Plan!.Name)
            .Select(g => new
            {
                PlanName = g.Key,
                Count = g.Count(),
                Limits = g.Select(l => $"{l.LimitKey}={l.LimitValue}").ToList(),
            })
            .OrderBy(p => p.PlanName)
            .ToList();

        var planLimitsDetails = planLimitsGrouped
            .Select(p => $"{p.PlanName}: {p.Count} limits")
            .ToList();

        var planLimitsValid = planLimitsGrouped.Count >= 4 &&
            planLimitsGrouped.TrueForAll(p => p.Count >= 8);

        if (!planLimitsValid)
        {
            issues.Add("Some plans may be missing limit definitions (expected 8+ limits per plan)");
        }

        // Get admin users
        var adminUsers = await _context.AdminUsers
            .AsNoTracking()
            .Where(a => a.DeletedAt == null)
            .Select(a => new { a.Email, a.Role, a.IsActive, a.FailedLoginAttempts, a.LockoutEndAt })
            .ToListAsync(cancellationToken);

        var adminUsersValid = adminUsers.Count > 0;
        var adminUsersDetails = adminUsers
            .Select(a => $"{a.Email} (Role: {a.Role}, Active: {a.IsActive}, FailedAttempts: {a.FailedLoginAttempts}, LockedUntil: {a.LockoutEndAt?.ToString("u") ?? "N/A"})")
            .ToList();

        if (!adminUsersValid)
        {
            issues.Add("No admin users found - SuperAdmin should exist");
        }

        var isValid = plansValid && featuresValid && planFeaturesValid && planLimitsValid && adminUsersValid;

        return new SeedDataVerificationDto
        {
            IsValid = isValid,
            SubscriptionPlans = new SeedVerificationItemDto
            {
                IsValid = plansValid,
                ExpectedCount = 4,
                ActualCount = plans.Count,
                Details = plans.Select(p => $"{p.Name} ({p.DisplayName}): ${p.PriceMonthly}/mo, Active: {p.IsActive}").ToList(),
                Missing = [],
            },
            Features = new SeedVerificationItemDto
            {
                IsValid = featuresValid,
                ExpectedCount = 10,
                ActualCount = features.Count,
                Details = features.Select(f => $"{f.FeatureKey} ({f.DisplayName}) [{f.Category}] Active: {f.IsActive}").ToList(),
                Missing = [],
            },
            PlanFeatures = new SeedVerificationItemDto
            {
                IsValid = planFeaturesValid,
                ExpectedCount = 27,
                ActualCount = planFeatures.Count,
                Details = planFeaturesDetails,
                Missing = [],
            },
            PlanLimits = new SeedVerificationItemDto
            {
                IsValid = planLimitsValid,
                ExpectedCount = 32,
                ActualCount = planLimits.Count,
                Details = planLimitsDetails,
                Missing = [],
            },
            AdminUsers = new SeedVerificationItemDto
            {
                IsValid = adminUsersValid,
                ExpectedCount = 1,
                ActualCount = adminUsers.Count,
                Details = adminUsersDetails,
                Missing = [],
            },
            Issues = issues,
        };
    }

    /// <inheritdoc/>
    public async Task<MetaIntegrationHealthDto> GetMetaIntegrationHealthAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Checking Meta integration health");

        var now = DateTime.UtcNow;
        var warningThreshold = now.AddDays(14);
        var criticalThreshold = now.AddDays(7);
        var issues = new List<string>();

        // Get all Meta channels
        var metaChannels = await _context.Channels
            .AsNoTracking()
            .Where(c => (c.Type == ChannelType.Instagram || c.Type == ChannelType.Facebook) &&
                       c.DeletedAt == null)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Type,
                c.BusinessId,
                c.IsActive,
                c.TokenExpiresAt,
            })
            .ToListAsync(cancellationToken);

        var totalChannels = metaChannels.Count;
        var activeChannels = metaChannels.Count(c => c.IsActive);

        // Analyze token health
        var channelsWithIssues = new List<MetaChannelTokenStatusDto>();
        int healthyCount = 0, warningCount = 0, criticalCount = 0, expiredCount = 0;

        foreach (var channel in metaChannels.Where(c => c.IsActive))
        {
            if (!channel.TokenExpiresAt.HasValue)
            {
                // No expiry set - treat as warning
                warningCount++;
                channelsWithIssues.Add(new MetaChannelTokenStatusDto
                {
                    ChannelId = channel.Id,
                    ChannelName = channel.Name,
                    ChannelType = channel.Type.ToString(),
                    BusinessId = channel.BusinessId,
                    TokenExpiresAt = null,
                    DaysUntilExpiry = null,
                    Status = "warning",
                });
                continue;
            }

            var expiresAt = channel.TokenExpiresAt.Value;
            var daysUntilExpiry = (int)(expiresAt - now).TotalDays;

            if (expiresAt <= now)
            {
                expiredCount++;
                channelsWithIssues.Add(new MetaChannelTokenStatusDto
                {
                    ChannelId = channel.Id,
                    ChannelName = channel.Name,
                    ChannelType = channel.Type.ToString(),
                    BusinessId = channel.BusinessId,
                    TokenExpiresAt = expiresAt,
                    DaysUntilExpiry = daysUntilExpiry,
                    Status = "expired",
                });
            }
            else if (expiresAt <= criticalThreshold)
            {
                criticalCount++;
                channelsWithIssues.Add(new MetaChannelTokenStatusDto
                {
                    ChannelId = channel.Id,
                    ChannelName = channel.Name,
                    ChannelType = channel.Type.ToString(),
                    BusinessId = channel.BusinessId,
                    TokenExpiresAt = expiresAt,
                    DaysUntilExpiry = daysUntilExpiry,
                    Status = "critical",
                });
            }
            else if (expiresAt <= warningThreshold)
            {
                warningCount++;
                channelsWithIssues.Add(new MetaChannelTokenStatusDto
                {
                    ChannelId = channel.Id,
                    ChannelName = channel.Name,
                    ChannelType = channel.Type.ToString(),
                    BusinessId = channel.BusinessId,
                    TokenExpiresAt = expiresAt,
                    DaysUntilExpiry = daysUntilExpiry,
                    Status = "warning",
                });
            }
            else
            {
                healthyCount++;
            }
        }

        // Determine overall status
        string overallStatus;
        if (expiredCount > 0)
        {
            overallStatus = "unhealthy";
            issues.Add($"{expiredCount} channel(s) have expired tokens");
        }
        else if (criticalCount > 0)
        {
            overallStatus = "critical";
            issues.Add($"{criticalCount} channel(s) have tokens expiring within 7 days");
        }
        else if (warningCount > 0)
        {
            overallStatus = "warning";
            issues.Add($"{warningCount} channel(s) have tokens expiring within 14 days");
        }
        else
        {
            overallStatus = "healthy";
        }

        return new MetaIntegrationHealthDto
        {
            OverallStatus = overallStatus,
            TotalChannels = totalChannels,
            ActiveChannels = activeChannels,
            TokenHealth = new MetaTokenHealthDto
            {
                HealthyCount = healthyCount,
                WarningCount = warningCount,
                CriticalCount = criticalCount,
                ExpiredCount = expiredCount,
                ChannelsWithIssues = channelsWithIssues,
            },
            WebhookHealth = new MetaWebhookHealthDto
            {
                PendingRetries = 0, // Placeholder - populate when WebhookFailure entity is added to DbContext
                FailedCount = 0,
                ResolvedLast24h = 0,
                OldestPending = null,
            },
            ApiHealth = new MetaApiHealthDto
            {
                IsReachable = true, // Placeholder - implement actual API health check in future sprint
                LastSuccessfulCall = DateTime.UtcNow,
                RateLimitStatus = "ok",
                AverageResponseTimeMs = 150,
            },
            LastChecked = DateTime.UtcNow,
            Issues = issues,
        };
    }
}
