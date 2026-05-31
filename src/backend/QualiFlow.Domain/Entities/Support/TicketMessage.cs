// -----------------------------------------------------------------------
// <copyright file="TicketMessage.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities.Support;

/// <summary>
/// Represents a message within a support ticket.
/// </summary>
public class TicketMessage : BaseEntity
{
    /// <summary>
    /// Gets or sets the ticket ID this message belongs to.
    /// </summary>
    public required Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is an internal note (admin only).
    /// </summary>
    public bool IsInternal { get; set; }

    /// <summary>
    /// Gets or sets the user ID who sent this message (if customer).
    /// </summary>
    public Guid? SentByUserId { get; set; }

    /// <summary>
    /// Gets or sets the admin ID who sent this message (if admin).
    /// </summary>
    public Guid? SentByAdminId { get; set; }

    /// <summary>
    /// Gets or sets the sender's name (for display).
    /// </summary>
    public required string SenderName { get; set; }

    /// <summary>
    /// Gets or sets the sender's email (for display).
    /// </summary>
    public required string SenderEmail { get; set; }

    /// <summary>
    /// Gets or sets the message type.
    /// </summary>
    public required TicketMessageType Type { get; set; }

    /// <summary>
    /// Gets or sets the ticket this message belongs to.
    /// </summary>
    public SupportTicket? Ticket { get; set; }

    /// <summary>
    /// Gets or sets the user who sent this message.
    /// </summary>
    public ApplicationUser? SentByUser { get; set; }

    /// <summary>
    /// Gets or sets the admin who sent this message.
    /// </summary>
    public AdminUser? SentByAdmin { get; set; }

    /// <summary>
    /// Gets the collection of attachments for this message.
    /// </summary>
    public ICollection<TicketAttachment> Attachments { get; } = [];
}
