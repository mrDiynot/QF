using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Deal entity operations.
/// </summary>
public interface IDealRepository
{
    /// <summary>
    /// Gets a deal by ID.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deal if found, otherwise null.</returns>
    Task<Deal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a deal by external CRM ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="externalCRMId">The external CRM deal ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deal if found, otherwise null.</returns>
    Task<Deal?> GetByExternalIdAsync(Guid businessId, string externalCRMId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deals for a business with optional filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="stage">Optional stage filter.</param>
    /// <param name="contactId">Optional contact filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of deals.</returns>
    Task<IEnumerable<Deal>> GetAllAsync(
        Guid businessId,
        DealStage? stage = null,
        Guid? contactId = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deals in the pipeline (open deals - not won or lost).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of open deals.</returns>
    Task<IEnumerable<Deal>> GetPipelineAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals by stage for pipeline view.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="stage">The stage to filter by.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals in the specified stage.</returns>
    Task<IEnumerable<Deal>> GetByStageAsync(Guid businessId, DealStage stage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals for a specific contact.
    /// </summary>
    /// <param name="contactId">The contact ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals for the contact.</returns>
    Task<IEnumerable<Deal>> GetByContactAsync(Guid contactId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals modified since a specific date (for sync).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="since">The date to filter from.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals modified since the specified date.</returns>
    Task<IEnumerable<Deal>> GetModifiedSinceAsync(Guid businessId, DateTime since, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new deal.
    /// </summary>
    /// <param name="deal">The deal to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created deal.</returns>
    Task<Deal> CreateAsync(Deal deal, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing deal.
    /// </summary>
    /// <param name="deal">The deal to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated deal.</returns>
    Task<Deal> UpdateAsync(Deal deal, CancellationToken cancellationToken = default);

    /// <summary>
    /// Moves a deal to a different stage.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="newStage">The new stage.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated deal.</returns>
    Task<Deal> MoveToStageAsync(Guid id, DealStage newStage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft deletes a deal.
    /// </summary>
    /// <param name="id">The deal ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Counts deals for a business with optional filters.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="stage">Optional stage filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Count of deals.</returns>
    Task<int> CountAsync(Guid businessId, DealStage? stage = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates the total pipeline value for a business (all open deals).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Total pipeline value.</returns>
    Task<decimal> GetTotalPipelineValueAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates the weighted pipeline value for a business (value * probability).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Weighted pipeline value.</returns>
    Task<decimal> GetWeightedPipelineValueAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets win rate statistics for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Win rate as percentage (0-100).</returns>
    Task<decimal> GetWinRateAsync(Guid businessId, CancellationToken cancellationToken = default);
}
