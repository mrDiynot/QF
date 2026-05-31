// -----------------------------------------------------------------------
// <copyright file="INotificationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for managing notifications.
/// </summary>
[SuppressMessage(
    "Design",
    "CA1054:URI-like parameters should not be strings",
    Justification = "URLs are stored as strings in database")]
public interface INotificationService
{
    /// <summary>
    /// Sends a notification to a specific user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="title">The notification title.</param>
    /// <param name="message">The notification message.</param>
    /// <param name="type">The notification type.</param>
    /// <param name="actionUrl">Optional action URL.</param>
    /// <param name="data">Optional data payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The notification ID.</returns>
    Task<Guid> SendToUserAsync(
        Guid businessId,
        Guid userId,
        string title,
        string message,
        string type = "Info",
        string? actionUrl = null,
        object? data = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a notification to all users in a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="title">The notification title.</param>
    /// <param name="message">The notification message.</param>
    /// <param name="type">The notification type.</param>
    /// <param name="actionUrl">Optional action URL.</param>
    /// <param name="data">Optional data payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The notification ID.</returns>
    Task<Guid> SendToBusinessAsync(
        Guid businessId,
        string title,
        string message,
        string type = "Info",
        string? actionUrl = null,
        object? data = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a usage alert to all users in a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="resourceName">The resource name (leads, messages, etc.).</param>
    /// <param name="thresholdPercent">The threshold percentage reached.</param>
    /// <param name="currentUsage">Current usage count.</param>
    /// <param name="limit">The usage limit.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendUsageAlertAsync(
        Guid businessId,
        string resourceName,
        int thresholdPercent,
        int currentUsage,
        int limit,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread notifications for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="limit">Maximum number to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of notification events.</returns>
    Task<IReadOnlyList<NotificationEvent>> GetUnreadAsync(
        Guid businessId,
        Guid userId,
        int limit = 50,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all notifications for a user with pagination.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Number of items per page.</param>
    /// <param name="unreadOnly">If true, only return unread notifications.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated notification response.</returns>
    Task<NotificationsPagedResponse> GetNotificationsAsync(
        Guid businessId,
        Guid userId,
        int page = 1,
        int pageSize = 20,
        bool unreadOnly = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a notification as read.
    /// </summary>
    /// <param name="notificationId">The notification ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks all notifications as read for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of notifications marked as read.</returns>
    Task<int> MarkAllAsReadAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets unread notification count for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The unread count.</returns>
    Task<int> GetUnreadCountAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    // ========== SPECIALIZED NOTIFICATION METHODS ==========

    /// <summary>
    /// Sends a trial expiring notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="daysRemaining">Days until trial expires.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyTrialExpiringAsync(
        Guid businessId,
        int daysRemaining,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a trial expired notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyTrialExpiredAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a payment failed notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="attemptNumber">The payment attempt number.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyPaymentFailedAsync(
        Guid businessId,
        int attemptNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a subscription suspended notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifySubscriptionSuspendedAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a new lead captured notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="channel">The source channel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyNewLeadAsync(
        Guid businessId,
        Guid leadId,
        string leadName,
        string channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a lead qualified notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="score">The qualification score.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyLeadQualifiedAsync(
        Guid businessId,
        Guid leadId,
        string leadName,
        int score,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a new message notification to assigned agent.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The assigned agent user ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="channel">The message channel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyNewMessageAsync(
        Guid businessId,
        Guid userId,
        Guid conversationId,
        string leadName,
        string channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a booking reminder notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The agent user ID.</param>
    /// <param name="bookingId">The booking ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="timeUntil">Time until the booking (e.g., "24 hours", "1 hour").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyBookingReminderAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        string timeUntil,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a form submission notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="formId">The form ID.</param>
    /// <param name="formName">The form name.</param>
    /// <param name="submitterName">The submitter name.</param>
    /// <param name="leadId">The created lead ID (if any).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyFormSubmissionAsync(
        Guid businessId,
        Guid formId,
        string formName,
        string submitterName,
        Guid? leadId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a team member joined notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="memberName">The new member's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyTeamMemberJoinedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a webhook failure notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="webhookName">The webhook name.</param>
    /// <param name="attemptCount">Number of failed attempts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyWebhookFailedAsync(
        Guid businessId,
        string webhookName,
        int attemptCount,
        CancellationToken cancellationToken = default);

    // ========== ADDITIONAL NOTIFICATION METHODS ==========

    /// <summary>
    /// Sends a subscription activated notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="planName">The plan name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifySubscriptionActivatedAsync(
        Guid businessId,
        string planName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a plan upgraded notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="oldPlan">The previous plan name.</param>
    /// <param name="newPlan">The new plan name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyPlanUpgradedAsync(
        Guid businessId,
        string oldPlan,
        string newPlan,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a plan downgraded notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="oldPlan">The previous plan name.</param>
    /// <param name="newPlan">The new plan name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyPlanDowngradedAsync(
        Guid businessId,
        string oldPlan,
        string newPlan,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a lead assigned notification to the assigned user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The assigned user ID.</param>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="assignedBy">Who assigned the lead.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyLeadAssignedAsync(
        Guid businessId,
        Guid userId,
        Guid leadId,
        string leadName,
        string assignedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a conversation assigned notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The assigned user ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="assignedBy">Who assigned the conversation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyConversationAssignedAsync(
        Guid businessId,
        Guid userId,
        Guid conversationId,
        string leadName,
        string assignedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a conversation escalated notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="conversationId">The conversation ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="reason">The escalation reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyConversationEscalatedAsync(
        Guid businessId,
        Guid conversationId,
        string leadName,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a booking scheduled notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The agent user ID.</param>
    /// <param name="bookingId">The booking ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="scheduledTime">The scheduled time.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyBookingScheduledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        DateTime scheduledTime,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a booking cancelled notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The agent user ID.</param>
    /// <param name="bookingId">The booking ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="reason">The cancellation reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyBookingCancelledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a booking rescheduled notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The agent user ID.</param>
    /// <param name="bookingId">The booking ID.</param>
    /// <param name="leadName">The lead name.</param>
    /// <param name="oldTime">The original time.</param>
    /// <param name="newTime">The new time.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyBookingRescheduledAsync(
        Guid businessId,
        Guid userId,
        Guid bookingId,
        string leadName,
        DateTime oldTime,
        DateTime newTime,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a team member removed notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="memberName">The removed member's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyTeamMemberRemovedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an invitation sent notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="inviteeEmail">The invitee's email.</param>
    /// <param name="invitedBy">Who sent the invitation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyInvitationSentAsync(
        Guid businessId,
        string inviteeEmail,
        string invitedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an invitation accepted notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="memberName">The new member's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyInvitationAcceptedAsync(
        Guid businessId,
        string memberName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a channel connected notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelName">The channel name.</param>
    /// <param name="channelType">The channel type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyChannelConnectedAsync(
        Guid businessId,
        string channelName,
        string channelType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a channel disconnected notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="channelName">The channel name.</param>
    /// <param name="channelType">The channel type.</param>
    /// <param name="reason">The disconnection reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyChannelDisconnectedAsync(
        Guid businessId,
        string channelName,
        string channelType,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a CRM sync completed notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="crmName">The CRM name.</param>
    /// <param name="recordsSynced">Number of records synced.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyCrmSyncCompleteAsync(
        Guid businessId,
        string crmName,
        int recordsSynced,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a CRM sync failed notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="crmName">The CRM name.</param>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyCrmSyncFailedAsync(
        Guid businessId,
        string crmName,
        string errorMessage,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an email bounced notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="recipientEmail">The recipient email.</param>
    /// <param name="reason">The bounce reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyEmailBouncedAsync(
        Guid businessId,
        string recipientEmail,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a system maintenance notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="scheduledTime">The maintenance scheduled time.</param>
    /// <param name="durationMinutes">Expected duration in minutes.</param>
    /// <param name="description">The maintenance description.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifySystemMaintenanceAsync(
        Guid businessId,
        DateTime scheduledTime,
        int durationMinutes,
        string description,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends a feature announcement notification.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="featureName">The feature name.</param>
    /// <param name="description">The feature description.</param>
    /// <param name="learnMoreUrl">Optional URL to learn more.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task NotifyFeatureAnnouncementAsync(
        Guid businessId,
        string featureName,
        string description,
        string? learnMoreUrl = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Paged response for notifications.
/// </summary>
public record NotificationsPagedResponse
{
    /// <summary>
    /// Gets the list of notifications.
    /// </summary>
    public IReadOnlyList<NotificationEvent> Data { get; init; } = [];

    /// <summary>
    /// Gets the total number of notifications.
    /// </summary>
    public int TotalCount { get; init; }

    /// <summary>
    /// Gets the number of unread notifications.
    /// </summary>
    public int UnreadCount { get; init; }
}
