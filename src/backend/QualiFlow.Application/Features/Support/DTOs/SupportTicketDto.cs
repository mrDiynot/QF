// -----------------------------------------------------------------------
// <copyright file="SupportTicketDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Support.DTOs;

/// <summary>
/// DTO for support ticket information.
/// </summary>
public sealed record SupportTicketDto
{
    /// <summary>
    /// Gets the ticket ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the ticket number.
    /// </summary>
    public required string TicketNumber { get; init; }

    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public Guid? BusinessId { get; init; }

    /// <summary>
    /// Gets the business name.
    /// </summary>
    public string? BusinessName { get; init; }

    /// <summary>
    /// Gets the reporter's email.
    /// </summary>
    public required string ReporterEmail { get; init; }

    /// <summary>
    /// Gets the reporter's name.
    /// </summary>
    public required string ReporterName { get; init; }

    /// <summary>
    /// Gets the category.
    /// </summary>
    public required TicketCategory Category { get; init; }

    /// <summary>
    /// Gets the priority.
    /// </summary>
    public required TicketPriority Priority { get; init; }

    /// <summary>
    /// Gets the status.
    /// </summary>
    public required TicketStatus Status { get; init; }

    /// <summary>
    /// Gets the subject.
    /// </summary>
    public required string Subject { get; init; }

    /// <summary>
    /// Gets the description.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Gets the first response due date.
    /// </summary>
    public DateTime? FirstResponseDue { get; init; }

    /// <summary>
    /// Gets the resolution due date.
    /// </summary>
    public DateTime? ResolutionDue { get; init; }

    /// <summary>
    /// Gets when first response was made.
    /// </summary>
    public DateTime? FirstResponseAt { get; init; }

    /// <summary>
    /// Gets when ticket was resolved.
    /// </summary>
    public DateTime? ResolvedAt { get; init; }

    /// <summary>
    /// Gets a value indicating whether SLA was breached.
    /// </summary>
    public bool SlaBreached { get; init; }

    /// <summary>
    /// Gets the assigned admin ID.
    /// </summary>
    public Guid? AssignedToAdminId { get; init; }

    /// <summary>
    /// Gets the assigned admin name.
    /// </summary>
    public string? AssignedToAdminName { get; init; }

    /// <summary>
    /// Gets when the ticket was created.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets when the ticket was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; init; }

    /// <summary>
    /// Gets the message count.
    /// </summary>
    public int MessageCount { get; init; }
}

/// <summary>
/// DTO for ticket message information.
/// </summary>
public sealed record TicketMessageDto
{
    /// <summary>
    /// Gets the message ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the ticket ID.
    /// </summary>
    public required Guid TicketId { get; init; }

    /// <summary>
    /// Gets the message content.
    /// </summary>
    public required string Content { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is an internal note.
    /// </summary>
    public bool IsInternal { get; init; }

    /// <summary>
    /// Gets the sender's name.
    /// </summary>
    public required string SenderName { get; init; }

    /// <summary>
    /// Gets the sender's email.
    /// </summary>
    public required string SenderEmail { get; init; }

    /// <summary>
    /// Gets the message type.
    /// </summary>
    public required TicketMessageType Type { get; init; }

    /// <summary>
    /// Gets a value indicating whether this was sent by an admin.
    /// </summary>
    public bool IsSentByAdmin { get; init; }

    /// <summary>
    /// Gets when the message was created.
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets the attachments.
    /// </summary>
    public IReadOnlyList<TicketAttachmentDto> Attachments { get; init; } = [];
}

/// <summary>
/// DTO for ticket attachment information.
/// </summary>
public sealed record TicketAttachmentDto
{
    /// <summary>
    /// Gets the attachment ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the file name.
    /// </summary>
    public required string FileName { get; init; }

    /// <summary>
    /// Gets the content type.
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// Gets the file size in bytes.
    /// </summary>
    public required long FileSizeBytes { get; init; }

    /// <summary>
    /// Gets when the attachment was created.
    /// </summary>
    public required DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request to create a new support ticket.
/// </summary>
public sealed record CreateTicketRequest
{
    /// <summary>
    /// Gets the category.
    /// </summary>
    public required TicketCategory Category { get; init; }

    /// <summary>
    /// Gets the priority.
    /// </summary>
    public required TicketPriority Priority { get; init; }

    /// <summary>
    /// Gets the subject.
    /// </summary>
    public required string Subject { get; init; }

    /// <summary>
    /// Gets the description.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Gets the reporter's email (for unauthenticated requests).
    /// </summary>
    public string? ReporterEmail { get; init; }

    /// <summary>
    /// Gets the reporter's name (for unauthenticated requests).
    /// </summary>
    public string? ReporterName { get; init; }
}

/// <summary>
/// Request to add a message to a ticket.
/// </summary>
public sealed record AddTicketMessageRequest
{
    /// <summary>
    /// Gets the message content.
    /// </summary>
    public required string Content { get; init; }

    /// <summary>
    /// Gets a value indicating whether this is an internal note (admin only).
    /// </summary>
    public bool IsInternal { get; init; }
}

/// <summary>
/// Request to update ticket status.
/// </summary>
public sealed record UpdateTicketStatusRequest
{
    /// <summary>
    /// Gets the new status.
    /// </summary>
    public required TicketStatus Status { get; init; }

    /// <summary>
    /// Gets an optional note about the status change.
    /// </summary>
    public string? Note { get; init; }
}

/// <summary>
/// Request to assign a ticket.
/// </summary>
public sealed record AssignTicketRequest
{
    /// <summary>
    /// Gets the admin ID to assign to.
    /// </summary>
    public required Guid AdminId { get; init; }
}

/// <summary>
/// Request to update ticket priority.
/// </summary>
public sealed record UpdateTicketPriorityRequest
{
    /// <summary>
    /// Gets the new priority.
    /// </summary>
    public required TicketPriority Priority { get; init; }

    /// <summary>
    /// Gets an optional reason for the change.
    /// </summary>
    public string? Reason { get; init; }
}

/// <summary>
/// Query parameters for listing tickets.
/// </summary>
public sealed record TicketQuery
{
    /// <summary>
    /// Gets the page number (1-based).
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets the status filter.
    /// </summary>
    public TicketStatus? Status { get; init; }

    /// <summary>
    /// Gets the priority filter.
    /// </summary>
    public TicketPriority? Priority { get; init; }

    /// <summary>
    /// Gets the category filter.
    /// </summary>
    public TicketCategory? Category { get; init; }

    /// <summary>
    /// Gets the assigned admin filter.
    /// </summary>
    public Guid? AssignedToAdminId { get; init; }

    /// <summary>
    /// Gets the business filter.
    /// </summary>
    public Guid? BusinessId { get; init; }

    /// <summary>
    /// Gets the SLA breached filter.
    /// </summary>
    public bool? SlaBreached { get; init; }

    /// <summary>
    /// Gets the search term.
    /// </summary>
    public string? SearchTerm { get; init; }

    /// <summary>
    /// Gets a value indicating whether to show unassigned tickets only.
    /// </summary>
    public bool? Unassigned { get; init; }
}

/// <summary>
/// Dashboard statistics for support tickets.
/// </summary>
public sealed record TicketDashboardStats
{
    /// <summary>
    /// Gets the total open tickets.
    /// </summary>
    public int TotalOpen { get; init; }

    /// <summary>
    /// Gets the new tickets today.
    /// </summary>
    public int NewToday { get; init; }

    /// <summary>
    /// Gets the tickets awaiting response.
    /// </summary>
    public int AwaitingResponse { get; init; }

    /// <summary>
    /// Gets the SLA breached tickets count.
    /// </summary>
    public int SlaBreached { get; init; }

    /// <summary>
    /// Gets the unassigned tickets count.
    /// </summary>
    public int Unassigned { get; init; }

    /// <summary>
    /// Gets the resolved today count.
    /// </summary>
    public int ResolvedToday { get; init; }

    /// <summary>
    /// Gets the tickets by priority.
    /// </summary>
    public required IDictionary<TicketPriority, int> ByPriority { get; init; }

    /// <summary>
    /// Gets the tickets by category.
    /// </summary>
    public required IDictionary<TicketCategory, int> ByCategory { get; init; }
}
