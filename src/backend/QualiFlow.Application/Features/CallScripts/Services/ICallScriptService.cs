// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Application.Features.CallScripts.DTOs;

namespace QualiFlow.Application.Features.CallScripts.Services;

/// <summary>
/// Service interface for call script operations.
/// </summary>
public interface ICallScriptService
{
    /// <summary>
    /// Creates a new call script.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The create request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created script.</returns>
    Task<CallScriptDto> CreateAsync(
        Guid businessId,
        CreateCallScriptRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing call script.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="scriptId">The script ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated script.</returns>
    Task<CallScriptDto?> UpdateAsync(
        Guid businessId,
        Guid scriptId,
        UpdateCallScriptRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a call script by ID.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="scriptId">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The script or null if not found.</returns>
    Task<CallScriptDto?> GetByIdAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all call scripts for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="includeInactive">Whether to include inactive scripts.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of scripts.</returns>
    Task<IReadOnlyList<CallScriptDto>> GetAllAsync(
        Guid businessId,
        bool includeInactive = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the default call script for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The default script or null if none set.</returns>
    Task<CallScriptDto?> GetDefaultAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Sets a script as the default for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="scriptId">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> SetAsDefaultAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a call script (soft delete).
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="scriptId">The script ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful.</returns>
    Task<bool> DeleteAsync(
        Guid businessId,
        Guid scriptId,
        CancellationToken cancellationToken = default);
}

