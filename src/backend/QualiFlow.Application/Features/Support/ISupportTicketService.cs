// -----------------------------------------------------------------------
// <copyright file="ISupportTicketService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.Support.DTOs;

namespace QualiFlow.Application.Features.Support;

/// <summary>
/// Service interface for support ticket operations.
/// </summary>
public interface ISupportTicketService
{
    /// <summary>
    /// Creates a new support ticket.
    /// </summary>
    /// <param name="request">The create ticket request.</param>
    /// <param name="userId">The user ID (null for unauthenticated).</param>
    /// <param name="businessId">The business ID (null for platform-wide).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created ticket.</returns>
    Task<SupportTicketDto> CreateTicketAsync(
        CreateTicketRequest request,
        Guid? userId,
        Guid? businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a ticket by ID.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The ticket, or null if not found.</returns>
    Task<SupportTicketDto?> GetTicketAsync(
        Guid ticketId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a ticket by ticket number.
    /// </summary>
    /// <param name="ticketNumber">The ticket number.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The ticket, or null if not found.</returns>
    Task<SupportTicketDto?> GetTicketByNumberAsync(
        string ticketNumber,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets tickets with pagination and filtering.
    /// </summary>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Paged list of tickets.</returns>
    Task<PagedResult<SupportTicketDto>> GetTicketsAsync(
        TicketQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets tickets for a specific user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Paged list of tickets.</returns>
    Task<PagedResult<SupportTicketDto>> GetUserTicketsAsync(
        Guid userId,
        TicketQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets tickets for a specific business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">The query parameters.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Paged list of tickets.</returns>
    Task<PagedResult<SupportTicketDto>> GetBusinessTicketsAsync(
        Guid businessId,
        TicketQuery query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a message to a ticket.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="request">The message request.</param>
    /// <param name="senderUserId">The sender user ID (null for admin).</param>
    /// <param name="senderAdminId">The sender admin ID (null for user).</param>
    /// <param name="senderName">The sender's name.</param>
    /// <param name="senderEmail">The sender's email.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created message.</returns>
    Task<TicketMessageDto> AddMessageAsync(
        Guid ticketId,
        AddTicketMessageRequest request,
        Guid? senderUserId,
        Guid? senderAdminId,
        string senderName,
        string senderEmail,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets messages for a ticket.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="includeInternal">Whether to include internal notes.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of messages.</returns>
    Task<IReadOnlyList<TicketMessageDto>> GetMessagesAsync(
        Guid ticketId,
        bool includeInternal = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates ticket status.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="request">The status update request.</param>
    /// <param name="adminId">The admin making the change.</param>
    /// <param name="adminName">The admin's name.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    Task<SupportTicketDto> UpdateStatusAsync(
        Guid ticketId,
        UpdateTicketStatusRequest request,
        Guid adminId,
        string adminName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Assigns a ticket to an admin.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="request">The assign request.</param>
    /// <param name="assignedByAdminId">The admin making the assignment.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    Task<SupportTicketDto> AssignTicketAsync(
        Guid ticketId,
        AssignTicketRequest request,
        Guid assignedByAdminId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates ticket priority.
    /// </summary>
    /// <param name="ticketId">The ticket ID.</param>
    /// <param name="request">The priority update request.</param>
    /// <param name="adminId">The admin making the change.</param>
    /// <param name="adminName">The admin's name.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The updated ticket.</returns>
    Task<SupportTicketDto> UpdatePriorityAsync(
        Guid ticketId,
        UpdateTicketPriorityRequest request,
        Guid adminId,
        string adminName,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets dashboard statistics.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Dashboard statistics.</returns>
    Task<TicketDashboardStats> GetDashboardStatsAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks for SLA breaches and updates tickets accordingly.
    /// </summary>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Number of tickets marked as breached.</returns>
    Task<int> CheckSlaBreachesAsync(CancellationToken cancellationToken = default);
}
