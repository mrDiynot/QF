using QualiFlow.Application.Features.QuickReplies.DTOs;

namespace QualiFlow.Application.Features.QuickReplies.Services;

/// <summary>
/// Service interface for quick reply operations.
/// </summary>
public interface IQuickReplyService
{
    /// <summary>
    /// Gets a quick reply by ID.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply response if found, null otherwise.</returns>
    Task<QuickReplyResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a quick reply by shortcut.
    /// </summary>
    /// <param name="shortcut">The shortcut to search for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The quick reply response if found, null otherwise.</returns>
    Task<QuickReplyResponse?> GetByShortcutAsync(string shortcut, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all quick replies for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of quick reply responses.</returns>
    Task<IReadOnlyList<QuickReplyResponse>> GetAllAsync(string? category = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new quick reply.
    /// </summary>
    /// <param name="request">The create request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created quick reply response.</returns>
    Task<QuickReplyResponse> CreateAsync(CreateQuickReplyRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated quick reply response if found, null otherwise.</returns>
    Task<QuickReplyResponse?> UpdateAsync(Guid id, UpdateQuickReplyRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Records usage of a quick reply.
    /// </summary>
    /// <param name="id">The quick reply ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task RecordUsageAsync(Guid id, CancellationToken cancellationToken = default);
}

