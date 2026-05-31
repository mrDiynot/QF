// -----------------------------------------------------------------------
// <copyright file="WebhookEventConstants.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Constants;

/// <summary>
/// Constants for webhook event types.
/// </summary>
public static class WebhookEventConstants
{
    // Lead events
    public const string LeadCreated = "lead.created";
    public const string LeadUpdated = "lead.updated";
    public const string LeadQualified = "lead.qualified";
    public const string LeadDisqualified = "lead.disqualified";
    public const string LeadDeleted = "lead.deleted";

    // Conversation events
    public const string ConversationCreated = "conversation.created";
    public const string ConversationUpdated = "conversation.updated";
    public const string ConversationClosed = "conversation.closed";
    public const string MessageReceived = "conversation.message_received";
    public const string MessageSent = "conversation.message_sent";

    // Booking events
    public const string BookingCreated = "booking.created";
    public const string BookingConfirmed = "booking.confirmed";
    public const string BookingCancelled = "booking.cancelled";
    public const string BookingRescheduled = "booking.rescheduled";

    // Form events
    public const string FormSubmissionReceived = "form.submission_received";

    // Usage/Overage events
    public const string UsageAlert50 = "usage.alert_50_percent";
    public const string UsageAlert75 = "usage.alert_75_percent";
    public const string UsageAlert90 = "usage.alert_90_percent";
    public const string UsageLimitReached = "usage.limit_reached";
    public const string UsageOverage = "usage.overage";

    // Subscription events
    public const string SubscriptionCreated = "subscription.created";
    public const string SubscriptionUpdated = "subscription.updated";
    public const string SubscriptionCancelled = "subscription.cancelled";
    public const string SubscriptionTrialExpiring = "subscription.trial_expiring";
    public const string SubscriptionPaymentFailed = "subscription.payment_failed";

    // System events
    public const string WebhookTest = "webhook.test";

    /// <summary>
    /// Gets all usage alert event types.
    /// </summary>
    public static readonly string[] UsageAlertEvents =
    [
        UsageAlert50,
        UsageAlert75,
        UsageAlert90,
        UsageLimitReached,
        UsageOverage,
    ];

    /// <summary>
    /// Gets all available webhook event types.
    /// </summary>
    public static readonly string[] AllEvents =
    [
        LeadCreated,
        LeadUpdated,
        LeadQualified,
        LeadDisqualified,
        LeadDeleted,
        ConversationCreated,
        ConversationUpdated,
        ConversationClosed,
        MessageReceived,
        MessageSent,
        BookingCreated,
        BookingConfirmed,
        BookingCancelled,
        BookingRescheduled,
        FormSubmissionReceived,
        UsageAlert50,
        UsageAlert75,
        UsageAlert90,
        UsageLimitReached,
        UsageOverage,
        SubscriptionCreated,
        SubscriptionUpdated,
        SubscriptionCancelled,
        SubscriptionTrialExpiring,
        SubscriptionPaymentFailed,
        WebhookTest,
    ];

    /// <summary>
    /// Gets the event type for a usage alert at a given threshold.
    /// </summary>
    /// <param name="threshold">The threshold percentage (50, 75, 90, or 100).</param>
    /// <returns>The event type string.</returns>
    public static string GetUsageAlertEvent(int threshold) => threshold switch
    {
        50 => UsageAlert50,
        75 => UsageAlert75,
        90 => UsageAlert90,
        100 => UsageLimitReached,
        _ => UsageOverage,
    };
}

