// -----------------------------------------------------------------------
// <copyright file="SupportTicket.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities.Support;

/// <summary>
/// Represents a support ticket in the system.
/// </summary>
public class SupportTicket : BaseEntity
{
    /// <summary>
    /// Gets or sets the unique ticket number (e.g., TKT-2024-00001).
    /// </summary>
    public required string TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the business ID (optional - for business-specific tickets).
    /// </summary>
    public Guid? BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who reported the ticket (for authenticated users).
    /// </summary>
    public Guid? ReportedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the reporter's email address.
    /// </summary>
    public required string ReporterEmail { get; set; }

    /// <summary>
    /// Gets or sets the reporter's name.
    /// </summary>
    public required string ReporterName { get; set; }

    /// <summary>
    /// Gets or sets the ticket category.
    /// </summary>
    public required TicketCategory Category { get; set; }

    /// <summary>
    /// Gets or sets the ticket priority.
    /// </summary>
    public required TicketPriority Priority { get; set; }

    /// <summary>
    /// Gets or sets the ticket status.
    /// </summary>
    public required TicketStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the ticket subject.
    /// </summary>
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the ticket description.
    /// </summary>
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the first response due date/time (SLA).
    /// </summary>
    public DateTime? FirstResponseDue { get; set; }

    /// <summary>
    /// Gets or sets the resolution due date/time (SLA).
    /// </summary>
    public DateTime? ResolutionDue { get; set; }

    /// <summary>
    /// Gets or sets when the first response was made.
    /// </summary>
    public DateTime? FirstResponseAt { get; set; }

    /// <summary>
    /// Gets or sets when the ticket was resolved.
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the SLA was breached.
    /// </summary>
    public bool SlaBreached { get; set; }

    /// <summary>
    /// Gets or sets the admin user ID the ticket is assigned to.
    /// </summary>
    public Guid? AssignedToAdminId { get; set; }

    /// <summary>
    /// Gets or sets the assigned admin user.
    /// </summary>
    public AdminUser? AssignedToAdmin { get; set; }

    /// <summary>
    /// Gets or sets the business associated with this ticket.
    /// </summary>
    public Business? Business { get; set; }

    /// <summary>
    /// Gets or sets the user who reported this ticket.
    /// </summary>
    public ApplicationUser? ReportedByUser { get; set; }

    /// <summary>
    /// Gets the collection of messages in this ticket.
    /// </summary>
    public ICollection<TicketMessage> Messages { get; } = [];

    /// <summary>
    /// Gets the collection of attachments in this ticket.
    /// </summary>
    public ICollection<TicketAttachment> Attachments { get; } = [];
}
