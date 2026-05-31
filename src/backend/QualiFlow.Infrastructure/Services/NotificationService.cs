// -----------------------------------------------------------------------
// <copyright file="NotificationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for sending and managing notifications.
/// </summary>
public partial class NotificationService : INotificationService
{
    private readonly QualiFlowDbContext _context;
    private readonly IHubClients<INotificationHubClient> _hubClients;
    private readonly ILogger<NotificationService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationService"/> class.
    /// </summary>
    public NotificationService(
        QualiFlowDbContext context,
        IHubClients<INotificationHubClient> hubClients,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubClients = hubClients;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<Guid> SendToUserAsync(
        Guid businessId,
        Guid userId,
        string title,
        string message,
        string type = "Info",
        string? actionUrl = null,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        var notification = await CreateNotificationAsync(
            businessId, userId, title, message, type, actionUrl, data, cancellationToken);

        // Send via SignalR to user group
        var userGroup = $"user_{userId}";
        var notificationEvent = MapToEvent(notification);
        await _hubClients.Group(userGroup).ReceiveNotification(notificationEvent);

        LogNotificationSentToUser(_logger, notification.Id, userId.ToString());
        return notification.Id;
    }

    /// <inheritdoc/>
    public async Task<Guid> SendToBusinessAsync(
        Guid businessId,
        string title,
        string message,
        string type = "Info",
        string? actionUrl = null,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        var notification = await CreateNotificationAsync(
            businessId, null, title, message, type, actionUrl, data, cancellationToken);

        // Send via SignalR to business group
        var businessGroup = $"business_{businessId}";
        var notificationEvent = MapToEvent(notification);
        await _hubClients.Group(businessGroup).ReceiveNotification(notificationEvent);

        LogNotificationSentToBusiness(_logger, notification.Id, businessId);
        return notification.Id;
    }

    /// <inheritdoc/>
    public async Task SendUsageAlertAsync(
        Guid businessId,
        string resourceName,
        int thresholdPercent,
        int currentUsage,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var alertEvent = new UsageAlertEvent
        {
            ResourceName = resourceName,
            ThresholdPercent = thresholdPercent,
            CurrentUsage = currentUsage,
            Limit = limit,
            CreatedAt = DateTime.UtcNow,
        };

        // Also create a persistent notification
        var title = thresholdPercent == 100
            ? $"Usage Limit Reached: {resourceName}"
            : $"Usage Alert: {thresholdPercent}% of {resourceName} limit used";
        var message = $"Current usage: {currentUsage:N0} / {limit:N0}";

        await CreateNotificationAsync(
            businessId,
            null,
            title,
            message,
            "UsageAlert",
            "/settings/billing",
            alertEvent,
            cancellationToken);

        // Send real-time alert
        var businessGroup = $"business_{businessId}";
        await _hubClients.Group(businessGroup).ReceiveUsageAlert(alertEvent);

        LogUsageAlertSent(_logger, businessId, resourceName, thresholdPercent);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<NotificationEvent>> GetUnreadAsync(
        Guid businessId,
        Guid userId,
        int limit = 50,
        CancellationToken cancellationToken = default)
    {
        var notifications = await _context.Set<Notification>()
            .AsNoTracking()
            .Where(n => n.BusinessId == businessId)
            .Where(n => n.UserId == null || n.UserId == userId)
            .Where(n => !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return notifications.Select(MapToEvent).ToList();
    }

    /// <inheritdoc/>
    public async Task<bool> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var affected = await _context.Set<Notification>()
            .Where(n => n.Id == notificationId)
            .Where(n => n.UserId == null || n.UserId == userId)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, DateTime.UtcNow),
                cancellationToken);

        return affected > 0;
    }

    /// <inheritdoc/>
    public async Task<int> MarkAllAsReadAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Notification>()
            .Where(n => n.BusinessId == businessId)
            .Where(n => n.UserId == null || n.UserId == userId)
            .Where(n => !n.IsRead)
            .ExecuteUpdateAsync(
                s => s
                    .SetProperty(n => n.IsRead, true)
                    .SetProperty(n => n.ReadAt, DateTime.UtcNow),
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Notification>()
            .AsNoTracking()
            .Where(n => n.BusinessId == businessId)
            .Where(n => n.UserId == null || n.UserId == userId)
            .Where(n => !n.IsRead)
            .CountAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<NotificationsPagedResponse> GetNotificationsAsync(
        Guid businessId,
        Guid userId,
        int page = 1,
        int pageSize = 20,
        bool unreadOnly = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Set<Notification>()
            .AsNoTracking()
            .Where(n => n.BusinessId == businessId)
            .Where(n => n.UserId == null || n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var unreadCount = await query.Where(n => !n.IsRead).CountAsync(cancellationToken);

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new NotificationsPagedResponse
        {
            Data = notifications.Select(MapToEvent).ToList(),
            TotalCount = totalCount,
            UnreadCount = unreadCount,
        };
    }

    private async Task<Notification> CreateNotificationAsync(
        Guid businessId,
        Guid? userId,
        string title,
        string message,
        string type,
        string? actionUrl,
        object? data,
        CancellationToken cancellationToken)
    {
        // Validate business exists to prevent foreign key constraint violations
        var businessExists = await _context.Set<Domain.Entities.Business>()
            .AnyAsync(b => b.Id == businessId, cancellationToken);

        if (!businessExists)
        {
            _logger.LogWarning(
                "Cannot create notification for non-existent business {BusinessId}. Skipping notification: {Title}",
                businessId,
                title);

            // Return a dummy notification that won't be saved
            return new Notification
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                UserId = userId,
                Title = title,
                Message = message,
                Type = NotificationType.Info,
                CreatedAt = DateTime.UtcNow,
            };
        }

        var notificationType = Enum.TryParse<NotificationType>(type, true, out var parsed)
            ? parsed
            : NotificationType.Info;

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            UserId = userId,
            Title = title,
            Message = message,
            Type = notificationType,
            ActionUrl = actionUrl,
            DataJson = data != null ? JsonSerializer.Serialize(data) : null,
            Priority = notificationType == NotificationType.UsageAlert ? NotificationPriority.High : NotificationPriority.Normal,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Set<Notification>().Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        return notification;
    }

    private static NotificationEvent MapToEvent(Notification notification)
    {
        return new NotificationEvent
        {
            Id = notification.Id,
            Type = notification.Type.ToString(),
            Title = notification.Title,
            Message = notification.Message,
            ActionUrl = notification.ActionUrl,
            Data = notification.DataJson != null
                ? JsonSerializer.Deserialize<object>(notification.DataJson)
                : null,
            Priority = notification.Priority.ToString(),
            CreatedAt = notification.CreatedAt,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
        };
    }

    // ========== SPECIALIZED NOTIFICATION METHODS ==========

    /// <inheritdoc/>
    public async Task NotifyTrialExpiringAsync(
        Guid businessId,
        int daysRemaining,
        CancellationToken cancellationToken = default)
    {
        var title = "Trial Expiring Soon";
        var message = $"Your trial expires in {daysRemaining} days. Upgrade now to keep your data.";

        await SendToBusinessAsync(
            businessId,
            title,
            message,
            nameof(NotificationType.Trial),
            "/settings/billing",
            new { DaysRemaining = daysRemaining },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyTrialExpiredAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Trial Expired",
            Domain.Constants.NotificationTemplates.TrialExpired,
            nameof(NotificationType.Trial),
            "/settings/billing",
            cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyPaymentFailedAsync(
        Guid businessId,
        int attemptNumber,
        CancellationToken cancellationToken = default)
    {
        var message = $"Payment failed (attempt {attemptNumber}). Please update your payment method.";

        await SendToBusinessAsync(
            businessId,
            "Payment Failed",
            message,
            nameof(NotificationType.Billing),
            "/settings/billing",
            new { AttemptNumber = attemptNumber },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifySubscriptionSuspendedAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Subscription Suspended",
            Domain.Constants.NotificationTemplates.SubscriptionSuspended,
            nameof(NotificationType.Subscription),
            "/settings/billing",
            cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyNewLeadAsync(
        Guid businessId,
        Guid leadId,
        string leadName,
        string channel,
        CancellationToken cancellationToken = default)
    {
        var message = $"New lead: {leadName} from {channel}";

        await SendToBusinessAsync(
            businessId,
            "New Lead",
            message,
            nameof(NotificationType.Lead),
            $"/leads/{leadId}",
            new { LeadId = leadId, Channel = channel },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyLeadQualifiedAsync(
        Guid businessId,
        Guid leadId,
        string leadName,
        int score,
        CancellationToken cancellationToken = default)
    {
        var message = $"{leadName} has been qualified with a score of {score}";

        await SendToBusinessAsync(
            businessId,
            "Lead Qualified",
            message,
            nameof(NotificationType.Lead),
            $"/leads/{leadId}",
            new { LeadId = leadId, Score = score },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyNewMessageAsync(
        Guid businessId,
        Guid userId,
        Guid conversationId,
        string leadName,
        string channel,
        CancellationToken cancellationToken = default)
    {
        var message = $"New message from {leadName} via {channel}";

        await SendToUserAsync(
            businessId,
            userId,
            "New Message",
            message,
            nameof(NotificationType.Message),
            $"/conversations/{conversationId}",
            new { ConversationId = conversationId, Channel = channel },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyBookingReminderAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        string timeUntil,
        CancellationToken cancellationToken = default)
    {
        var message = $"Reminder: Booking with {leadName} in {timeUntil}";

        await SendToUserAsync(
            businessId,
            userId,
            "Booking Reminder",
            message,
            nameof(NotificationType.BookingReminder),
            $"/bookings/{bookingId}",
            new { BookingId = bookingId, TimeUntil = timeUntil },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyFormSubmissionAsync(
        Guid businessId,
        Guid formId,
        string formName,
        string submitterName,
        Guid? leadId = null,
        CancellationToken cancellationToken = default)
    {
        var message = $"New submission on {formName} from {submitterName}";

        var actionUrl = leadId.HasValue
            ? $"/leads/{leadId.Value}"
            : $"/forms/{formId}/submissions";

        await SendToBusinessAsync(
            businessId,
            "Form Submission",
            message,
            nameof(NotificationType.FormSubmission),
            actionUrl,
            new { FormId = formId, LeadId = leadId },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyTeamMemberJoinedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default)
    {
        var message = $"{memberName} has joined your team.";

        await SendToBusinessAsync(
            businessId,
            "Team Member Joined",
            message,
            nameof(NotificationType.TeamMember),
            "/settings/team",
            new { MemberName = memberName },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyWebhookFailedAsync(
        Guid businessId,
        string webhookName,
        int attemptCount,
        CancellationToken cancellationToken = default)
    {
        var message = $"Webhook '{webhookName}' delivery failed after {attemptCount} attempts.";

        await SendToBusinessAsync(
            businessId,
            "Webhook Failed",
            message,
            nameof(NotificationType.Webhook),
            "/settings/webhooks",
            new { WebhookName = webhookName, AttemptCount = attemptCount },
            cancellationToken);
    }

    // ========== ADDITIONAL NOTIFICATION IMPLEMENTATIONS ==========

    /// <inheritdoc/>
    public async Task NotifySubscriptionActivatedAsync(
        Guid businessId,
        string planName,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Subscription Activated",
            $"Your {planName} subscription is now active. Enjoy all the features!",
            nameof(NotificationType.Subscription),
            "/settings/billing",
            new { PlanName = planName },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyPlanUpgradedAsync(
        Guid businessId,
        string oldPlan,
        string newPlan,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Plan Upgraded",
            $"You've upgraded from {oldPlan} to {newPlan}. New features are now available!",
            nameof(NotificationType.Subscription),
            "/settings/billing",
            new { OldPlan = oldPlan, NewPlan = newPlan },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyPlanDowngradedAsync(
        Guid businessId,
        string oldPlan,
        string newPlan,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Plan Changed",
            $"Your plan has been changed from {oldPlan} to {newPlan}.",
            nameof(NotificationType.Subscription),
            "/settings/billing",
            new { OldPlan = oldPlan, NewPlan = newPlan },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyLeadAssignedAsync(
        Guid businessId,
        Guid userId,
        Guid leadId,
        string leadName,
        string assignedBy,
        CancellationToken cancellationToken = default)
    {
        await SendToUserAsync(
            businessId,
            userId,
            "Lead Assigned to You",
            $"{leadName} has been assigned to you by {assignedBy}",
            nameof(NotificationType.Lead),
            $"/leads/{leadId}",
            new { LeadId = leadId, AssignedBy = assignedBy },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyConversationAssignedAsync(
        Guid businessId,
        Guid userId,
        Guid conversationId,
        string leadName,
        string assignedBy,
        CancellationToken cancellationToken = default)
    {
        await SendToUserAsync(
            businessId,
            userId,
            "Conversation Assigned",
            $"Conversation with {leadName} has been assigned to you by {assignedBy}",
            nameof(NotificationType.Conversation),
            $"/conversations/{conversationId}",
            new { ConversationId = conversationId, AssignedBy = assignedBy },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyConversationEscalatedAsync(
        Guid businessId,
        Guid conversationId,
        string leadName,
        string reason,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Conversation Escalated",
            $"Conversation with {leadName} requires attention: {reason}",
            nameof(NotificationType.Conversation),
            $"/conversations/{conversationId}",
            new { ConversationId = conversationId, Reason = reason },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyBookingScheduledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        DateTime scheduledTime,
        CancellationToken cancellationToken = default)
    {
        var formattedTime = scheduledTime.ToString("MMM d, yyyy 'at' h:mm tt", System.Globalization.CultureInfo.InvariantCulture);
        await SendToUserAsync(
            businessId,
            userId,
            "New Booking Scheduled",
            $"Meeting with {leadName} scheduled for {formattedTime}",
            nameof(NotificationType.Booking),
            $"/calendar?date={scheduledTime:yyyy-MM-dd}",
            new { BookingId = bookingId, ScheduledTime = scheduledTime },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyBookingCancelledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        string reason,
        CancellationToken cancellationToken = default)
    {
        await SendToUserAsync(
            businessId,
            userId,
            "Booking Cancelled",
            $"Meeting with {leadName} has been cancelled. Reason: {reason}",
            nameof(NotificationType.Booking),
            "/calendar",
            new { BookingId = bookingId, Reason = reason },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyBookingRescheduledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        DateTime oldTime,
        DateTime newTime,
        CancellationToken cancellationToken = default)
    {
        var formattedNewTime = newTime.ToString("MMM d, yyyy 'at' h:mm tt", System.Globalization.CultureInfo.InvariantCulture);
        await SendToUserAsync(
            businessId,
            userId,
            "Booking Rescheduled",
            $"Meeting with {leadName} has been moved to {formattedNewTime}",
            nameof(NotificationType.Booking),
            $"/calendar?date={newTime:yyyy-MM-dd}",
            new { BookingId = bookingId, OldTime = oldTime, NewTime = newTime },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyTeamMemberRemovedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Team Member Removed",
            $"{memberName} has been removed from your team.",
            nameof(NotificationType.TeamMember),
            "/settings/team",
            new { MemberName = memberName },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyInvitationSentAsync(
        Guid businessId,
        string inviteeEmail,
        string invitedBy,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Invitation Sent",
            $"Team invitation sent to {inviteeEmail} by {invitedBy}",
            nameof(NotificationType.Invitation),
            "/settings/team",
            new { InviteeEmail = inviteeEmail, InvitedBy = invitedBy },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyInvitationAcceptedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Invitation Accepted",
            $"{memberName} has accepted the team invitation and joined your workspace.",
            nameof(NotificationType.Invitation),
            "/settings/team",
            new { MemberName = memberName },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyChannelConnectedAsync(
        Guid businessId,
        string channelName,
        string channelType,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Channel Connected",
            $"{channelName} ({channelType}) has been successfully connected.",
            nameof(NotificationType.Channel),
            "/channels",
            new { ChannelName = channelName, ChannelType = channelType },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyChannelDisconnectedAsync(
        Guid businessId,
        string channelName,
        string channelType,
        string reason,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Channel Disconnected",
            $"{channelName} ({channelType}) has been disconnected: {reason}",
            nameof(NotificationType.Channel),
            "/channels",
            new { ChannelName = channelName, ChannelType = channelType, Reason = reason },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyCrmSyncCompleteAsync(
        Guid businessId,
        string crmName,
        int recordsSynced,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "CRM Sync Complete",
            $"Successfully synced {recordsSynced} records with {crmName}.",
            nameof(NotificationType.CrmSync),
            "/settings/integrations",
            new { CrmName = crmName, RecordsSynced = recordsSynced },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyCrmSyncFailedAsync(
        Guid businessId,
        string crmName,
        string errorMessage,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "CRM Sync Failed",
            $"Failed to sync with {crmName}: {errorMessage}",
            nameof(NotificationType.CrmSync),
            "/settings/integrations",
            new { CrmName = crmName, Error = errorMessage },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyEmailBouncedAsync(
        Guid businessId,
        string recipientEmail,
        string reason,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            "Email Bounced",
            $"Email to {recipientEmail} bounced: {reason}",
            nameof(NotificationType.Email),
            "/settings/email",
            new { RecipientEmail = recipientEmail, Reason = reason },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifySystemMaintenanceAsync(
        Guid businessId,
        DateTime scheduledTime,
        int durationMinutes,
        string description,
        CancellationToken cancellationToken = default)
    {
        var formattedTime = scheduledTime.ToString("MMM d, yyyy 'at' h:mm tt", System.Globalization.CultureInfo.InvariantCulture);
        await SendToBusinessAsync(
            businessId,
            "Scheduled Maintenance",
            $"System maintenance scheduled for {formattedTime} (approx. {durationMinutes} min): {description}",
            nameof(NotificationType.System),
            null,
            new { ScheduledTime = scheduledTime, DurationMinutes = durationMinutes },
            cancellationToken);
    }

    /// <inheritdoc/>
    public async Task NotifyFeatureAnnouncementAsync(
        Guid businessId,
        string featureName,
        string description,
        string? learnMoreUrl = null,
        CancellationToken cancellationToken = default)
    {
        await SendToBusinessAsync(
            businessId,
            $"New Feature: {featureName}",
            description,
            nameof(NotificationType.System),
            learnMoreUrl,
            new { FeatureName = featureName },
            cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Notification {NotificationId} sent to user {UserId}")]
    private static partial void LogNotificationSentToUser(ILogger logger, Guid notificationId, string userId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Notification {NotificationId} sent to business {BusinessId}")]
    private static partial void LogNotificationSentToBusiness(ILogger logger, Guid notificationId, Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Usage alert sent to business {BusinessId}: {ResourceName} at {ThresholdPercent}%")]
    private static partial void LogUsageAlertSent(ILogger logger, Guid businessId, string resourceName, int thresholdPercent);
}

