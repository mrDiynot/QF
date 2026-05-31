// -----------------------------------------------------------------------
// <copyright file="TicketEnums.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Support ticket categories.
/// </summary>
public enum TicketCategory
{
    /// <summary>
    /// No category specified.
    /// </summary>
    None = 0,

    /// <summary>
    /// Technical support requests.
    /// </summary>
    TechnicalSupport = 1,

    /// <summary>
    /// Billing and payment inquiries.
    /// </summary>
    BillingInquiry = 2,

    /// <summary>
    /// Feature requests and suggestions.
    /// </summary>
    FeatureRequest = 3,

    /// <summary>
    /// Account-related issues.
    /// </summary>
    AccountIssue = 4,

    /// <summary>
    /// General questions and inquiries.
    /// </summary>
    GeneralQuestion = 5
}

/// <summary>
/// Support ticket priority levels.
/// Each level has associated SLA targets.
/// </summary>
public enum TicketPriority
{
    /// <summary>
    /// No priority specified.
    /// </summary>
    None = 0,

    /// <summary>
    /// Low priority: 72h first response, 7 days resolution.
    /// </summary>
    Low = 1,

    /// <summary>
    /// Medium priority: 24h first response, 3 days resolution.
    /// </summary>
    Medium = 2,

    /// <summary>
    /// High priority: 4h first response, 24h resolution.
    /// </summary>
    High = 3,

    /// <summary>
    /// Critical priority: 1h first response, 4h resolution.
    /// </summary>
    Critical = 4
}

/// <summary>
/// Support ticket status values.
/// </summary>
public enum TicketStatus
{
    /// <summary>
    /// No status specified.
    /// </summary>
    None = 0,

    /// <summary>
    /// New ticket, not yet reviewed.
    /// </summary>
    New = 1,

    /// <summary>
    /// Ticket is open and being worked on.
    /// </summary>
    Open = 2,

    /// <summary>
    /// Waiting for customer response.
    /// </summary>
    AwaitingCustomer = 3,

    /// <summary>
    /// Awaiting internal review or escalation.
    /// </summary>
    AwaitingInternal = 4,

    /// <summary>
    /// Actively being worked on.
    /// </summary>
    InProgress = 5,

    /// <summary>
    /// Ticket is on hold pending external factors.
    /// </summary>
    OnHold = 6,

    /// <summary>
    /// Issue has been resolved.
    /// </summary>
    Resolved = 7,

    /// <summary>
    /// Ticket is closed.
    /// </summary>
    Closed = 8
}

/// <summary>
/// Types of messages in a support ticket.
/// </summary>
public enum TicketMessageType
{
    /// <summary>
    /// No type specified.
    /// </summary>
    None = 0,

    /// <summary>
    /// A reply to the ticket.
    /// </summary>
    Reply = 1,

    /// <summary>
    /// An internal note (admin only).
    /// </summary>
    InternalNote = 2,

    /// <summary>
    /// A status change notification.
    /// </summary>
    StatusChange = 3,

    /// <summary>
    /// System-generated message.
    /// </summary>
    System = 4
}
