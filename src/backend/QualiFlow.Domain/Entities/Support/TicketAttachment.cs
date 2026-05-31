// -----------------------------------------------------------------------
// <copyright file="TicketAttachment.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities.Support;

/// <summary>
/// Represents an attachment to a support ticket or message.
/// </summary>
public class TicketAttachment : BaseEntity
{
    /// <summary>
    /// Gets or sets the ticket ID this attachment belongs to.
    /// </summary>
    public required Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the message ID this attachment belongs to (optional).
    /// </summary>
    public Guid? MessageId { get; set; }

    /// <summary>
    /// Gets or sets the file name.
    /// </summary>
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the content type (MIME type).
    /// </summary>
    public required string ContentType { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public required long FileSizeBytes { get; set; }

    /// <summary>
    /// Gets or sets the storage URL (Azure Blob/S3).
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "String is required for EF Core mapping and JSON serialization")]
    public required string StorageUrl { get; set; }

    /// <summary>
    /// Gets or sets the ticket this attachment belongs to.
    /// </summary>
    public SupportTicket? Ticket { get; set; }

    /// <summary>
    /// Gets or sets the message this attachment belongs to.
    /// </summary>
    public TicketMessage? Message { get; set; }
}
