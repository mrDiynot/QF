using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a file attachment on a message.
/// </summary>
public class MessageAttachment : BaseEntity
{
    /// <summary>
    /// Gets or sets the message ID this attachment belongs to.
    /// </summary>
    public Guid MessageId { get; set; }

    /// <summary>
    /// Gets or sets the original file name.
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the content type (MIME type).
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Gets or sets the Azure Blob Storage URL.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database for flexibility")]
    public string BlobUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the blob name in storage.
    /// </summary>
    public string BlobName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the container name in storage.
    /// </summary>
    public string ContainerName { get; set; } = string.Empty;

    // Navigation properties

    /// <summary>
    /// Gets or sets the message this attachment belongs to.
    /// </summary>
    public Message Message { get; set; } = null!;
}

