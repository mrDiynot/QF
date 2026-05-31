// -----------------------------------------------------------------------
// <copyright file="NotificationTemplates.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Constants;

/// <summary>
/// Centralized notification message templates for consistent messaging across the platform.
/// Use string.Format() or interpolation with the provided placeholders.
/// </summary>
public static class NotificationTemplates
{
    // ========== TRIAL & SUBSCRIPTION ==========

    /// <summary>Trial expiring soon. {0}=days remaining.</summary>
    public const string TrialExpiringSoon = "Your trial expires in {0} days. Upgrade now to keep your data.";

    /// <summary>Trial has expired.</summary>
    public const string TrialExpired = "Your trial has expired. Upgrade to continue using QualiFlow.";

    /// <summary>Subscription activated. {0}=plan name.</summary>
    public const string SubscriptionActivated = "Welcome! Your {0} subscription is now active.";

    /// <summary>Subscription upgraded. {0}=new plan name.</summary>
    public const string SubscriptionUpgraded = "Your subscription has been upgraded to {0}.";

    /// <summary>Subscription downgraded. {0}=new plan name.</summary>
    public const string SubscriptionDowngraded = "Your subscription has been changed to {0}.";

    /// <summary>Subscription suspended due to payment failure.</summary>
    public const string SubscriptionSuspended = "Your subscription has been suspended due to payment failure.";

    // ========== BILLING ==========

    /// <summary>Payment failed. {0}=attempt number.</summary>
    public const string PaymentFailed = "Payment failed (attempt {0}). Please update your payment method.";

    /// <summary>Payment successful. {0}=amount.</summary>
    public const string PaymentSuccessful = "Payment of {0} was successful. Thank you!";

    /// <summary>Invoice generated. {0}=invoice number, {1}=amount.</summary>
    public const string InvoiceGenerated = "Invoice {0} for {1} has been generated.";

    // ========== USAGE ALERTS ==========

    /// <summary>Usage threshold reached. {0}=resource name, {1}=percentage.</summary>
    public const string UsageThreshold = "You've used {1}% of your {0} limit.";

    /// <summary>Usage limit reached. {0}=resource name.</summary>
    public const string UsageLimitReached = "You've reached your {0} limit. Upgrade to continue.";

    /// <summary>Overage incurred. {0}=resource name, {1}=overage amount.</summary>
    public const string UsageOverage = "You've exceeded your {0} limit by {1}. Overage charges apply.";

    // ========== LEADS ==========

    /// <summary>New lead captured. {0}=lead name, {1}=channel.</summary>
    public const string NewLeadCaptured = "New lead: {0} from {1}";

    /// <summary>Lead qualified. {0}=lead name, {1}=score.</summary>
    public const string LeadQualified = "{0} has been qualified with a score of {1}";

    /// <summary>Lead assigned. {0}=lead name.</summary>
    public const string LeadAssigned = "Lead {0} has been assigned to you.";

    /// <summary>Bulk import complete. {0}=count.</summary>
    public const string BulkImportComplete = "Bulk import complete: {0} leads imported.";

    /// <summary>Bulk import failed. {0}=error message.</summary>
    public const string BulkImportFailed = "Bulk import failed: {0}";

    // ========== CONVERSATIONS ==========

    /// <summary>New message received. {0}=lead name, {1}=channel.</summary>
    public const string NewMessage = "New message from {0} via {1}";

    /// <summary>Conversation assigned. {0}=lead name.</summary>
    public const string ConversationAssigned = "Conversation with {0} has been assigned to you.";

    /// <summary>Mentioned in note. {0}=mentioner name, {1}=lead name.</summary>
    public const string MentionedInNote = "{0} mentioned you in a note on {1}'s conversation.";

    /// <summary>AI auto-response sent. {0}=lead name.</summary>
    public const string AiResponseSent = "AI auto-response sent to {0}";

    // ========== BOOKINGS ==========

    /// <summary>New booking created. {0}=lead name, {1}=date/time.</summary>
    public const string BookingCreated = "New booking: {0} scheduled for {1}";

    /// <summary>Booking confirmed. {0}=lead name, {1}=date/time.</summary>
    public const string BookingConfirmed = "Booking with {0} confirmed for {1}";

    /// <summary>Booking cancelled. {0}=lead name.</summary>
    public const string BookingCancelled = "Booking with {0} has been cancelled.";

    /// <summary>Booking reminder. {0}=lead name, {1}=time until.</summary>
    public const string BookingReminder = "Reminder: Booking with {0} in {1}";

    // ========== FORMS ==========

    /// <summary>New form submission. {0}=form name, {1}=submitter name.</summary>
    public const string FormSubmission = "New submission on {0} from {1}";

    // ========== TEAM ==========

    /// <summary>Team member joined. {0}=member name.</summary>
    public const string TeamMemberJoined = "{0} has joined your team.";

    /// <summary>Team member role changed. {0}=member name, {1}=new role.</summary>
    public const string TeamMemberRoleChanged = "{0}'s role has been changed to {1}.";

    /// <summary>Team member removed. {0}=member name.</summary>
    public const string TeamMemberRemoved = "{0} has been removed from your team.";

    /// <summary>Invitation sent. {0}=email.</summary>
    public const string InvitationSent = "Invitation sent to {0}";

    /// <summary>Invitation accepted. {0}=member name.</summary>
    public const string InvitationAccepted = "{0} has accepted the invitation.";

    // ========== INTEGRATIONS ==========

    /// <summary>Webhook delivery failed. {0}=webhook name, {1}=attempts.</summary>
    public const string WebhookFailed = "Webhook '{0}' delivery failed after {1} attempts.";

    /// <summary>Channel connected. {0}=channel type.</summary>
    public const string ChannelConnected = "{0} channel has been connected.";

    /// <summary>Channel disconnected. {0}=channel type.</summary>
    public const string ChannelDisconnected = "{0} channel has been disconnected.";

    /// <summary>CRM sync complete. {0}=CRM name, {1}=count.</summary>
    public const string CrmSyncComplete = "{0} sync complete: {1} records synchronized.";

    /// <summary>CRM sync failed. {0}=CRM name, {1}=error.</summary>
    public const string CrmSyncFailed = "{0} sync failed: {1}";

    /// <summary>Email bounced. {0}=recipient email.</summary>
    public const string EmailBounced = "Email to {0} bounced.";

    // ========== SYSTEM ==========

    /// <summary>System maintenance scheduled. {0}=date/time.</summary>
    public const string MaintenanceScheduled = "Scheduled maintenance on {0}";

    /// <summary>System update available. {0}=version.</summary>
    public const string SystemUpdate = "New system update available: {0}";
}

