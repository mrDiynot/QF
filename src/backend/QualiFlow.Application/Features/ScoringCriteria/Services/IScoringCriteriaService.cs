// -----------------------------------------------------------------------
// <copyright file="IScoringCriteriaService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.ScoringCriteria.DTOs;

namespace QualiFlow.Application.Features.ScoringCriteria.Services;

/// <summary>
/// Service interface for scoring criteria operations.
/// </summary>
public interface IScoringCriteriaService
{
    /// <summary>Gets all scoring criteria for the current business.</summary>
    /// <param name="includeInactive">Include inactive criteria in the response.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of scoring criteria with summary information.</returns>
    Task<ScoringCriteriaListResponse> GetAllAsync(
        bool includeInactive = false,
        CancellationToken cancellationToken = default);

    /// <summary>Gets a scoring criterion by ID.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring criterion if found, null otherwise.</returns>
    Task<ScoringCriteriaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>Creates a new scoring criterion.</summary>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created scoring criterion.</returns>
    Task<ScoringCriteriaResponse> CreateAsync(
        CreateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>Updates an existing scoring criterion.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated scoring criterion if found, null otherwise.</returns>
    Task<ScoringCriteriaResponse?> UpdateAsync(
        Guid id,
        UpdateScoringCriteriaRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>Deletes a scoring criterion.</summary>
    /// <param name="id">The criterion ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>Initializes default BANT criteria for a new business.</summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task InitializeDefaultCriteriaAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>Validates that weights sum to 100.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if weights sum to 100.</returns>
    Task<bool> ValidateWeightsAsync(
        CancellationToken cancellationToken = default);
}

