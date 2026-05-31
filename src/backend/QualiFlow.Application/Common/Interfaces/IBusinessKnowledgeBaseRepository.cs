// -----------------------------------------------------------------------
// <copyright file="IBusinessKnowledgeBaseRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for business knowledge base operations.
/// </summary>
public interface IBusinessKnowledgeBaseRepository
{
    /// <summary>
    /// Gets all knowledge entries for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of knowledge entries.</returns>
    Task<IReadOnlyList<BusinessKnowledgeBase>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets knowledge entries by type.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="type">The entry type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of entries of the specified type.</returns>
    Task<IReadOnlyList<BusinessKnowledgeBase>> GetByTypeAsync(Guid businessId, KnowledgeEntryType type, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific knowledge entry.
    /// </summary>
    /// <param name="id">The entry ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The entry if found; otherwise, null.</returns>
    Task<BusinessKnowledgeBase?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new knowledge entry.
    /// </summary>
    /// <param name="entry">The entry to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created entry.</returns>
    Task<BusinessKnowledgeBase> CreateAsync(BusinessKnowledgeBase entry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing knowledge entry.
    /// </summary>
    /// <param name="entry">The entry to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the operation.</returns>
    Task UpdateAsync(BusinessKnowledgeBase entry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a knowledge entry.
    /// </summary>
    /// <param name="id">The entry ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the operation.</returns>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches knowledge entries by keywords.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="query">The search query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of matching entries.</returns>
    Task<IReadOnlyList<BusinessKnowledgeBase>> SearchAsync(Guid businessId, string query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets high-priority entries for AI context injection.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="maxEntries">Maximum number of entries.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of high-priority entries.</returns>
    Task<IReadOnlyList<BusinessKnowledgeBase>> GetForAIContextAsync(Guid businessId, int maxEntries = 10, CancellationToken cancellationToken = default);
}
