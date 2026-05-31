// -----------------------------------------------------------------------
// <copyright file="IScoringCriteriaRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for scoring criteria operations.
/// </summary>
public interface IScoringCriteriaRepository
{
    /// <summary>Gets all active scoring criteria for a business.</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of active scoring criteria.</returns>
    Task<IReadOnlyList<ScoringCriteria>> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>Gets all scoring criteria for a business (including inactive).</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all scoring criteria.</returns>
    Task<IReadOnlyList<ScoringCriteria>> GetAllByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>Gets a scoring criterion by ID.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring criterion if found, null otherwise.</returns>
    Task<ScoringCriteria?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>Gets a scoring criterion by name for a business.</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="name">The criterion name.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring criterion if found, null otherwise.</returns>
    Task<ScoringCriteria?> GetByNameAsync(
        Guid businessId,
        string name,
        CancellationToken cancellationToken = default);

    /// <summary>Creates a new scoring criterion.</summary>
    /// <param name="criteria">The criterion to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created scoring criterion.</returns>
    Task<ScoringCriteria> CreateAsync(
        ScoringCriteria criteria,
        CancellationToken cancellationToken = default);

    /// <summary>Updates an existing scoring criterion.</summary>
    /// <param name="criteria">The criterion to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated scoring criterion.</returns>
    Task<ScoringCriteria> UpdateAsync(
        ScoringCriteria criteria,
        CancellationToken cancellationToken = default);

    /// <summary>Deletes a scoring criterion.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>Checks if weights sum to 100 for active criteria.</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="excludeId">Optional criterion ID to exclude from calculation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if weights sum to 100.</returns>
    Task<bool> ValidateWeightsSumAsync(
        Guid businessId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);

    /// <summary>Gets the total weight of active criteria for a business.</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="excludeId">Optional criterion ID to exclude from calculation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The total weight of active criteria.</returns>
    Task<int> GetTotalWeightAsync(
        Guid businessId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);
}

