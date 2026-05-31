using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for message attachment operations.
/// </summary>
public interface IMessageAttachmentRepository
{
    /// <summary>
    /// Gets an attachment by ID.
    /// </summary>
    /// <param name="id">The attachment ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The attachment or null.</returns>
    Task<MessageAttachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all attachments for a message.
    /// </summary>
    /// <param name="messageId">The message ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of attachments.</returns>
    Task<IReadOnlyList<MessageAttachment>> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new attachment.
    /// </summary>
    /// <param name="attachment">The attachment to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added attachment.</returns>
    Task<MessageAttachment> AddAsync(
        MessageAttachment attachment,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an attachment.
    /// </summary>
    /// <param name="attachment">The attachment to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task.</returns>
    Task DeleteAsync(MessageAttachment attachment, CancellationToken cancellationToken = default);
}

