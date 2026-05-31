// <copyright file="ISavedSearchRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Features.Search.Repositories;

/// <summary>
/// Repository interface for SavedSearch entity (S15-BE-003).
/// </summary>
public interface ISavedSearchRepository
{
    /// <summary>
    /// Gets a saved search by ID.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The saved search, or null if not found.</returns>
    Task<SavedSearch?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all saved searches for a business and user.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="includeShared">If true, include shared searches from other users.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of saved searches.</returns>
    Task<IReadOnlyList<SavedSearch>> GetAllAsync(
        Guid businessId,
        Guid userId,
        bool includeShared = true,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets saved searches by entity type.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="entityType">The entity type (Lead, Contact, Conversation, Message, Deal).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of saved searches for the entity type.</returns>
    Task<IReadOnlyList<SavedSearch>> GetByEntityTypeAsync(
        Guid businessId,
        Guid userId,
        string entityType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new saved search.
    /// </summary>
    /// <param name="savedSearch">The saved search to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created saved search.</returns>
    Task<SavedSearch> CreateAsync(SavedSearch savedSearch, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing saved search.
    /// </summary>
    /// <param name="savedSearch">The saved search to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated saved search.</returns>
    Task<SavedSearch> UpdateAsync(SavedSearch savedSearch, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a saved search.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Increments the usage count and updates last used timestamp.
    /// </summary>
    /// <param name="id">The saved search ID.</param>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task.</returns>
    Task IncrementUsageAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
}

