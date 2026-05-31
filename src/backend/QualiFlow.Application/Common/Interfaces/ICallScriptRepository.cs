// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for call script operations.
/// </summary>
public interface ICallScriptRepository
{
    /// <summary>
    /// Gets a call script by ID.
    /// </summary>
    /// <param name="id">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The call script or null if not found.</returns>
    Task<CallScript?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default call script for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The default call script or null if none set.</returns>
    Task<CallScript?> GetDefaultAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all call scripts for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="includeInactive">Whether to include inactive scripts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of call scripts.</returns>
    Task<IReadOnlyList<CallScript>> GetAllAsync(
        Guid businessId,
        bool includeInactive = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new call script.
    /// </summary>
    /// <param name="script">The script to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(CallScript script, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a call script.
    /// </summary>
    /// <param name="script">The script to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(CallScript script, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a call script (soft delete).
    /// </summary>
    /// <param name="script">The script to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(CallScript script, CancellationToken cancellationToken = default);

    /// <summary>
    /// Clears the default flag from all scripts for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ClearDefaultAsync(Guid businessId, CancellationToken cancellationToken = default);
}

