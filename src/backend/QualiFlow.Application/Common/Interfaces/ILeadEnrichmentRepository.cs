// -----------------------------------------------------------------------
// <copyright file="ILeadEnrichmentRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for lead enrichment operations.
/// </summary>
public interface ILeadEnrichmentRepository
{
    /// <summary>
    /// Gets enrichment data for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The enrichment data if found; otherwise, null.</returns>
    Task<LeadEnrichment?> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets enrichment data by source.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="source">The enrichment source.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The enrichment data if found; otherwise, null.</returns>
    Task<LeadEnrichment?> GetByLeadIdAndSourceAsync(Guid leadId, string source, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new enrichment record.
    /// </summary>
    /// <param name="enrichment">The enrichment to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created enrichment.</returns>
    Task<LeadEnrichment> CreateAsync(LeadEnrichment enrichment, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing enrichment record.
    /// </summary>
    /// <param name="enrichment">The enrichment to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the operation.</returns>
    Task UpdateAsync(LeadEnrichment enrichment, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets leads that need enrichment refresh.
    /// </summary>
    /// <param name="maxResults">Maximum results to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of lead IDs needing refresh.</returns>
    Task<IReadOnlyList<Guid>> GetLeadsNeedingRefreshAsync(int maxResults = 100, CancellationToken cancellationToken = default);
}
