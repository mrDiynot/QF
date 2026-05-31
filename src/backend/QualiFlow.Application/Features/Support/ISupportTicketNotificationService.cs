// -----------------------------------------------------------------------
// <copyright file="ISupportTicketNotificationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Support.DTOs;

namespace QualiFlow.Application.Features.Support;

/// <summary>
/// Service for sending support ticket email notifications.
/// </summary>
public interface ISupportTicketNotificationService
{
    /// <summary>
    /// Sends notification when a new ticket is created.
    /// </summary>
    /// <param name="ticket">The created ticket.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendTicketCreatedNotificationAsync(
        SupportTicketDto ticket,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a ticket is assigned to an admin.
    /// </summary>
    /// <param name="ticket">The ticket.</param>
    /// <param name="adminEmail">The assigned admin's email.</param>
    /// <param name="adminName">The assigned admin's name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendTicketAssignedNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        string adminName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a ticket status is updated.
    /// </summary>
    /// <param name="ticket">The ticket with updated status.</param>
    /// <param name="previousStatus">The previous status.</param>
    /// <param name="note">Optional note about the status change.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendStatusUpdateNotificationAsync(
        SupportTicketDto ticket,
        string previousStatus,
        string? note = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when a new message is added to a ticket.
    /// </summary>
    /// <param name="ticket">The ticket.</param>
    /// <param name="message">The new message.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendNewMessageNotificationAsync(
        SupportTicketDto ticket,
        TicketMessageDto message,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when SLA is at risk of being breached.
    /// </summary>
    /// <param name="ticket">The ticket at risk.</param>
    /// <param name="adminEmail">The assigned admin's email (or support inbox if unassigned).</param>
    /// <param name="minutesRemaining">Minutes remaining before SLA breach.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendSlaWarningNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        int minutesRemaining,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends notification when SLA has been breached.
    /// </summary>
    /// <param name="ticket">The ticket that breached SLA.</param>
    /// <param name="adminEmail">The assigned admin's email (or support inbox if unassigned).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task SendSlaBreachedNotificationAsync(
        SupportTicketDto ticket,
        string adminEmail,
        CancellationToken cancellationToken = default);
}
