// <copyright file="OverageAlertService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Text.Json;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Application.Features.Subscriptions.Services;
using QualiFlow.Application.Features.Webhooks.Services;
using QualiFlow.Domain.Constants;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing overage alerts.
/// Sends alerts via email, in-app notifications, and webhooks.
/// </summary>
public partial class OverageAlertService : IOverageAlertService
{
    private readonly QualiFlowDbContext _context;
    private readonly IUsageLimitService _usageLimitService;
    private readonly ISubscriptionService _subscriptionService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IWebhookService _webhookService;
    private readonly ILogger<OverageAlertService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="OverageAlertService"/> class.
    /// </summary>
    public OverageAlertService(
        QualiFlowDbContext context,
        IUsageLimitService usageLimitService,
        ISubscriptionService subscriptionService,
        IEmailService emailService,
        INotificationService notificationService,
        IWebhookService webhookService,
        ILogger<OverageAlertService> logger)
    {
        _context = context;
        _usageLimitService = usageLimitService;
        _subscriptionService = subscriptionService;
        _emailService = emailService;
        _notificationService = notificationService;
        _webhookService = webhookService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<OverageAlertSettingsDto> GetSettingsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var settings = await _context.Set<OverageAlertSettings>()
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (settings == null)
        {
            // Return defaults
            return new OverageAlertSettingsDto();
        }

        return MapToDto(settings);
    }

    /// <inheritdoc />
    public async Task<OverageAlertSettingsDto> UpdateSettingsAsync(
        Guid businessId,
        UpdateOverageAlertSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var settings = await _context.Set<OverageAlertSettings>()
            .FirstOrDefaultAsync(s => s.BusinessId == businessId, cancellationToken);

        if (settings == null)
        {
            settings = new OverageAlertSettings { BusinessId = businessId };
            _context.Set<OverageAlertSettings>().Add(settings);
        }

        if (request.IsEnabled.HasValue)
        {
            settings.IsEnabled = request.IsEnabled.Value;
        }

        if (request.EmailNotificationsEnabled.HasValue)
        {
            settings.EmailNotificationsEnabled = request.EmailNotificationsEnabled.Value;
        }

        if (request.InAppNotificationsEnabled.HasValue)
        {
            settings.InAppNotificationsEnabled = request.InAppNotificationsEnabled.Value;
        }

        if (request.AlertAt50Percent.HasValue)
        {
            settings.AlertAt50Percent = request.AlertAt50Percent.Value;
        }

        if (request.AlertAt75Percent.HasValue)
        {
            settings.AlertAt75Percent = request.AlertAt75Percent.Value;
        }

        if (request.AlertAt90Percent.HasValue)
        {
            settings.AlertAt90Percent = request.AlertAt90Percent.Value;
        }

        if (request.AlertAt100Percent.HasValue)
        {
            settings.AlertAt100Percent = request.AlertAt100Percent.Value;
        }

        if (request.NotifyEmails != null)
        {
            settings.NotifyEmailsJson = JsonSerializer.Serialize(request.NotifyEmails);
        }

        settings.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Updated overage alert settings for business {BusinessId}", businessId);

        return MapToDto(settings);
    }

    /// <inheritdoc />
    public async Task<int> CheckAndSendAlertsAsync(CancellationToken cancellationToken = default)
    {
        var alertsSent = 0;
        var businesses = await _context.Businesses
            .Where(b => b.DeletedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var business in businesses)
        {
            try
            {
                var sent = await CheckBusinessUsageAsync(business, cancellationToken);
                alertsSent += sent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking usage for business {BusinessId}", business.Id);
            }
        }

        _logger.LogInformation("Overage alert check completed. Sent {AlertCount} alerts.", alertsSent);
        return alertsSent;
    }

    private async Task<int> CheckBusinessUsageAsync(Business business, CancellationToken cancellationToken)
    {
        var settings = await _context.Set<OverageAlertSettings>()
            .FirstOrDefaultAsync(s => s.BusinessId == business.Id, cancellationToken);

        // Use default settings if not configured
        var isEnabled = settings?.IsEnabled ?? true;
        if (!isEnabled)
        {
            return 0;
        }

        var usage = await _usageLimitService.GetUsageCountersAsync(business.Id, cancellationToken);
        if (usage == null)
        {
            return 0;
        }

        var limits = await _subscriptionService.GetBusinessLimitsAsync(business.Id, cancellationToken);
        var alertsSent = 0;

        // Check leads usage
        alertsSent += await CheckResourceUsageAsync(
            business, settings, "leads",
            usage.CurrentLeadsCount, ParseLimit(limits, LimitConstants.MaxLeads),
            cancellationToken);

        // Check messages usage
        alertsSent += await CheckResourceUsageAsync(
            business, settings, "messages",
            usage.MonthlyMessagesCount, ParseLimit(limits, LimitConstants.MaxMessages),
            cancellationToken);

        // Check channels usage
        alertsSent += await CheckResourceUsageAsync(
            business, settings, "channels",
            usage.CurrentChannelsCount, ParseLimit(limits, LimitConstants.MaxChannels),
            cancellationToken);

        // Check seats usage
        alertsSent += await CheckResourceUsageAsync(
            business, settings, "seats",
            usage.CurrentSeatsCount, ParseLimit(limits, LimitConstants.MaxSeats),
            cancellationToken);

        return alertsSent;
    }

    private async Task<int> CheckResourceUsageAsync(
        Business business,
        OverageAlertSettings? settings,
        string resourceName,
        int currentUsage,
        int limit,
        CancellationToken cancellationToken)
    {
        if (limit <= 0 || limit == int.MaxValue)
        {
            return 0;
        }

        var percentage = (currentUsage * 100) / limit;
        var alertsSent = 0;
        var now = DateTime.UtcNow;
        var billingCycleStart = DateTime.UtcNow.AddDays(-DateTime.UtcNow.Day + 1).Date;

        // Check each threshold
        if (percentage >= 100 && ShouldAlert(settings, 100, settings?.LastAlertAt100Percent, billingCycleStart))
        {
            await SendAlertAsync(business, settings, resourceName, 100, currentUsage, limit, cancellationToken);
            if (settings != null)
            {
                settings.LastAlertAt100Percent = now;
            }

            alertsSent++;
        }
        else if (percentage >= 90 && ShouldAlert(settings, 90, settings?.LastAlertAt90Percent, billingCycleStart))
        {
            await SendAlertAsync(business, settings, resourceName, 90, currentUsage, limit, cancellationToken);
            if (settings != null)
            {
                settings.LastAlertAt90Percent = now;
            }

            alertsSent++;
        }
        else if (percentage >= 75 && ShouldAlert(settings, 75, settings?.LastAlertAt75Percent, billingCycleStart))
        {
            await SendAlertAsync(business, settings, resourceName, 75, currentUsage, limit, cancellationToken);
            if (settings != null)
            {
                settings.LastAlertAt75Percent = now;
            }

            alertsSent++;
        }
        else if (percentage >= 50 && ShouldAlert(settings, 50, settings?.LastAlertAt50Percent, billingCycleStart))
        {
            await SendAlertAsync(business, settings, resourceName, 50, currentUsage, limit, cancellationToken);
            if (settings != null)
            {
                settings.LastAlertAt50Percent = now;
            }

            alertsSent++;
        }

        if (alertsSent > 0 && settings != null)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return alertsSent;
    }

    private static bool ShouldAlert(OverageAlertSettings? settings, int threshold, DateTime? lastAlert, DateTime billingCycleStart)
    {
        // Check if alert is enabled for this threshold
        var alertEnabled = threshold switch
        {
            50 => settings?.AlertAt50Percent ?? false,
            75 => settings?.AlertAt75Percent ?? true,
            90 => settings?.AlertAt90Percent ?? true,
            100 => settings?.AlertAt100Percent ?? true,
            _ => false
        };

        if (!alertEnabled)
        {
            return false;
        }

        // Only send once per billing cycle
        return !lastAlert.HasValue || lastAlert.Value < billingCycleStart;
    }

    private async Task SendAlertAsync(
        Business business,
        OverageAlertSettings? settings,
        string resourceName,
        int threshold,
        int currentUsage,
        int limit,
        CancellationToken cancellationToken)
    {
        // 1. Send email alerts
        var emailEnabled = settings?.EmailNotificationsEnabled ?? true;
        if (emailEnabled)
        {
            await SendEmailAlertAsync(business, settings, resourceName, threshold, currentUsage, limit, cancellationToken);
        }

        // 2. Send in-app notifications via SignalR
        var inAppEnabled = settings?.InAppNotificationsEnabled ?? true;
        if (inAppEnabled)
        {
            try
            {
                await _notificationService.SendUsageAlertAsync(
                    business.Id,
                    resourceName,
                    threshold,
                    currentUsage,
                    limit,
                    cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send in-app notification for business {BusinessId}", business.Id);
            }
        }

        // 3. Send webhook events
        try
        {
            var eventType = WebhookEventConstants.GetUsageAlertEvent(threshold);
            var payload = JsonSerializer.Serialize(new
            {
                businessId = business.Id,
                resourceName,
                thresholdPercent = threshold,
                currentUsage,
                limit,
                timestamp = DateTime.UtcNow,
            });
            await _webhookService.DeliverEventAsync(eventType, payload, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send webhook for business {BusinessId}", business.Id);
        }
    }

    private async Task SendEmailAlertAsync(
        Business business,
        OverageAlertSettings? settings,
        string resourceName,
        int threshold,
        int currentUsage,
        int limit,
        CancellationToken cancellationToken)
    {
        // Get notification emails
        var emails = settings != null
            ? JsonSerializer.Deserialize<List<string>>(settings.NotifyEmailsJson) ?? []
            : [];

        if (emails.Count == 0)
        {
            emails.Add(business.Email);
        }

        var subject = threshold == 100
            ? $"[QualiFlow] Usage Limit Reached: {resourceName}"
            : $"[QualiFlow] Usage Alert: {threshold}% of {resourceName} limit used";

        var body = $@"
<h2>Usage Alert for {business.Name}</h2>
<p>Your {resourceName} usage has reached <strong>{threshold}%</strong> of your plan limit.</p>
<ul>
    <li>Current usage: {currentUsage:N0}</li>
    <li>Plan limit: {limit:N0}</li>
</ul>
<p>Consider upgrading your plan to avoid service interruptions.</p>
<p><a href='https://app.qualiflow.ai/settings/billing'>Manage your subscription</a></p>
";

        foreach (var email in emails)
        {
            try
            {
                var request = new SendEmailRequest
                {
                    BusinessId = business.Id,
                    ToEmail = email,
                    FromEmail = "alerts@qualiflow.ai",
                    FromName = "QualiFlow",
                    Subject = subject,
                    HtmlBody = body,
                };
                await _emailService.SendEmailAsync(request, cancellationToken);
                _logger.LogInformation(
                    "Sent {Threshold}% overage alert for {Resource} to {Email} (Business: {BusinessId})",
                    threshold, resourceName, email, business.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send overage alert email to {Email}", email);
            }
        }
    }

    private static int ParseLimit(IReadOnlyDictionary<string, string> limits, string key)
    {
        var value = limits.GetValueOrDefault(key, "unlimited");
        return value == "unlimited" ? int.MaxValue : int.Parse(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    private static OverageAlertSettingsDto MapToDto(OverageAlertSettings settings)
    {
        var emails = JsonSerializer.Deserialize<List<string>>(settings.NotifyEmailsJson) ?? [];

        return new OverageAlertSettingsDto
        {
            IsEnabled = settings.IsEnabled,
            EmailNotificationsEnabled = settings.EmailNotificationsEnabled,
            InAppNotificationsEnabled = settings.InAppNotificationsEnabled,
            AlertAt50Percent = settings.AlertAt50Percent,
            AlertAt75Percent = settings.AlertAt75Percent,
            AlertAt90Percent = settings.AlertAt90Percent,
            AlertAt100Percent = settings.AlertAt100Percent,
            NotifyEmails = emails,
        };
    }
}
