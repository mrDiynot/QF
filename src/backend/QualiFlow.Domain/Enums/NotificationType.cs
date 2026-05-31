// -----------------------------------------------------------------------
// <copyright file="NotificationType.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Types of notifications organized by category.
/// Ranges: General (0-9), Subscription (10-19), Leads (20-29), Bookings (30-39),
/// Forms (40-49), Team (50-59), Integrations (60-69), Admin (70-79), System (90-99).
/// </summary>
public enum NotificationType
{
    // ========== GENERAL (0-9) ==========

    /// <summary>
    /// General information notification.
    /// </summary>
    Info = 0,

    /// <summary>
    /// Warning notification.
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Error or critical notification.
    /// </summary>
    Error = 2,

    /// <summary>
    /// Success notification.
    /// </summary>
    Success = 3,

    // ========== SUBSCRIPTION & BILLING (10-19) ==========

    /// <summary>
    /// Usage alert notification (50%, 75%, 90%, limit reached).
    /// </summary>
    UsageAlert = 10,

    /// <summary>
    /// Subscription status change (activated, upgraded, downgraded).
    /// </summary>
    Subscription = 11,

    /// <summary>
    /// Billing notification (payment, invoice, failed payment).
    /// </summary>
    Billing = 12,

    /// <summary>
    /// Trial notification (expiring, expired).
    /// </summary>
    Trial = 13,

    // ========== LEADS & CONVERSATIONS (20-29) ==========

    /// <summary>
    /// Lead notification (new lead, qualified, assigned).
    /// </summary>
    Lead = 20,

    /// <summary>
    /// Conversation notification (assigned, closed).
    /// </summary>
    Conversation = 21,

    /// <summary>
    /// Message notification (new inbound, AI response).
    /// </summary>
    Message = 22,

    /// <summary>
    /// Mention notification (@mention in internal note).
    /// </summary>
    Mention = 23,

    // ========== BOOKINGS (30-39) ==========

    /// <summary>
    /// Booking notification (created, confirmed, cancelled).
    /// </summary>
    Booking = 30,

    /// <summary>
    /// Booking reminder notification (24h, 1h).
    /// </summary>
    BookingReminder = 31,

    // ========== FORMS (40-49) ==========

    /// <summary>
    /// Form submission notification.
    /// </summary>
    FormSubmission = 40,

    // ========== TEAM (50-59) ==========

    /// <summary>
    /// Team member notification (joined, role changed, removed).
    /// </summary>
    TeamMember = 50,

    /// <summary>
    /// Invitation notification (sent, accepted, expired).
    /// </summary>
    Invitation = 51,

    // ========== INTEGRATIONS (60-69) ==========

    /// <summary>
    /// Webhook notification (failed, retries exhausted).
    /// </summary>
    Webhook = 60,

    /// <summary>
    /// Channel notification (connected, disconnected, auth expiring).
    /// </summary>
    Channel = 61,

    /// <summary>
    /// CRM sync notification (complete, failed).
    /// </summary>
    CrmSync = 62,

    /// <summary>
    /// Email notification (sent, bounced, spam).
    /// </summary>
    Email = 63,

    // ========== ADMIN (70-79) ==========

    /// <summary>
    /// System health notification (degraded, down, recovered).
    /// </summary>
    SystemHealth = 70,

    /// <summary>
    /// Security notification (suspicious activity, failed logins).
    /// </summary>
    Security = 71,

    /// <summary>
    /// Support ticket notification (new, assigned, SLA).
    /// </summary>
    SupportTicket = 72,

    // ========== SYSTEM (90-99) ==========

    /// <summary>
    /// System notification (maintenance, updates).
    /// </summary>
    System = 90,
}

