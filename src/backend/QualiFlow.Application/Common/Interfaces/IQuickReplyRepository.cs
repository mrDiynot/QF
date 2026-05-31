using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for QuickReply entity operations.
/// </summary>
public interface IQuickReplyRepository
{
    /// <summary>
    /// Gets a quick reply by ID.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply if found, null otherwise.</returns>
    Task<QuickReply?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a quick reply by shortcut.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="shortcut">The shortcut trigger.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply if found, null otherwise.</returns>
    Task<QuickReply?> GetByShortcutAsync(Guid businessId, string shortcut, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all quick replies for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="category">Optional category filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of quick replies.</returns>
    Task<IReadOnlyList<QuickReply>> GetAllAsync(Guid businessId, string? category = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new quick reply.
    /// </summary>
    /// <param name="quickReply">The quick reply to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task AddAsync(QuickReply quickReply, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing quick reply.
    /// </summary>
    /// <param name="quickReply">The quick reply to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task UpdateAsync(QuickReply quickReply, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a quick reply.
    /// </summary>
    /// <param name="quickReply">The quick reply to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task DeleteAsync(QuickReply quickReply, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the usage count for a quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task IncrementUsageCountAsync(Guid id, CancellationToken cancellationToken = default);
}

