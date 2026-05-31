// -----------------------------------------------------------------------
// <copyright file="IBusinessScoringConfigurationRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for business scoring configuration operations.
/// </summary>
public interface IBusinessScoringConfigurationRepository
{
    /// <summary>
    /// Gets the scoring configuration for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring configuration if found; otherwise, null.</returns>
    Task<BusinessScoringConfiguration?> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new scoring configuration.
    /// </summary>
    /// <param name="configuration">The configuration to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created configuration.</returns>
    Task<BusinessScoringConfiguration> CreateAsync(BusinessScoringConfiguration configuration, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing scoring configuration.
    /// </summary>
    /// <param name="configuration">The configuration to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the operation.</returns>
    Task UpdateAsync(BusinessScoringConfiguration configuration, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates default configuration for a business if none exists.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="industry">Optional industry for template defaults.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The existing or newly created configuration.</returns>
    Task<BusinessScoringConfiguration> GetOrCreateDefaultAsync(Guid businessId, string? industry = null, CancellationToken cancellationToken = default);
}
