using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.CRM.Services;

/// <summary>
/// Service interface for Deal business logic and pipeline management.
/// </summary>
public interface IDealService
{
    /// <summary>
    /// Gets a deal by ID.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The deal if found and belongs to current business, otherwise null.</returns>
    Task<Deal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all deals for the current business with optional filters.
    /// </summary>
    /// <param name="stage">Optional stage filter.</param>
    /// <param name="contactId">Optional contact filter.</param>
    /// <param name="assignedToUserId">Optional assigned user filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals.</returns>
    Task<IEnumerable<Deal>> GetAllAsync(
        DealStage? stage = null,
        Guid? contactId = null,
        Guid? assignedToUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the pipeline (all open deals).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of open deals.</returns>
    Task<IEnumerable<Deal>> GetPipelineAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals by stage.
    /// </summary>
    /// <param name="stage">The stage to filter by.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals in the specified stage.</returns>
    Task<IEnumerable<Deal>> GetByStageAsync(DealStage stage, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets deals for a specific contact.
    /// </summary>
    /// <param name="contactId">The contact ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Collection of deals for the contact.</returns>
    Task<IEnumerable<Deal>> GetByContactAsync(Guid contactId, CancellationToken cancellationToken = default);

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
    /// Moves a deal to a different stage in the pipeline.
    /// </summary>
    /// <param name="id">The deal ID.</param>
    /// <param name="newStage">The new stage.</param>
    /// <param name="lossReason">The reason for losing the deal (required if moving to Lost stage).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated deal.</returns>
    Task<Deal> MoveToStageAsync(Guid id, DealStage newStage, string? lossReason = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a deal.
    /// </summary>
    /// <param name="id">The deal ID to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the total pipeline value (all open deals).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Total pipeline value.</returns>
    Task<decimal> GetTotalPipelineValueAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the weighted pipeline value (value * probability).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Weighted pipeline value.</returns>
    Task<decimal> GetWeightedPipelineValueAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the win rate percentage.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Win rate as percentage (0-100).</returns>
    Task<decimal> GetWinRateAsync(CancellationToken cancellationToken = default);
}
