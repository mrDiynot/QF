using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository for message attachment operations.
/// </summary>
/// <param name="context">The database context.</param>
/// <param name="logger">The logger.</param>
public partial class MessageAttachmentRepository(
    QualiFlowDbContext context,
    ILogger<MessageAttachmentRepository> logger) : IMessageAttachmentRepository
{
    /// <inheritdoc/>
    public Task<MessageAttachment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return context.MessageAttachments
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<MessageAttachment>> GetByMessageIdAsync(
        Guid messageId,
        CancellationToken cancellationToken = default)
    {
        return await context.MessageAttachments
            .AsNoTracking()
            .Where(a => a.MessageId == messageId)
            .OrderBy(a => a.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<MessageAttachment> AddAsync(
        MessageAttachment attachment,
        CancellationToken cancellationToken = default)
    {
        LogAddingAttachment(attachment.FileName, attachment.MessageId);

        await context.MessageAttachments.AddAsync(attachment, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return attachment;
    }

    /// <inheritdoc/>
    public Task DeleteAsync(MessageAttachment attachment, CancellationToken cancellationToken = default)
    {
        LogDeletingAttachment(attachment.Id, attachment.FileName);

        context.MessageAttachments.Remove(attachment);
        return context.SaveChangesAsync(cancellationToken);
    }

    [LoggerMessage(Level = LogLevel.Debug, Message = "Adding attachment {FileName} to message {MessageId}")]
    private partial void LogAddingAttachment(string fileName, Guid messageId);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Deleting attachment {AttachmentId} ({FileName})")]
    private partial void LogDeletingAttachment(Guid attachmentId, string fileName);
}

