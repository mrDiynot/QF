// <copyright file="IBulkOperationsService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.BulkOperations.DTOs;

namespace QualiFlow.Application.Features.BulkOperations.Services;

/// <summary>
/// Service interface for bulk operations on entities.
/// </summary>
public interface IBulkOperationsService
{
    /// <summary>
    /// Performs bulk update on leads.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The bulk update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    Task<BulkOperationResult> BulkUpdateLeadsAsync(
        Guid businessId,
        BulkUpdateLeadsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs bulk delete on leads.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    Task<BulkOperationResult> BulkDeleteLeadsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs bulk delete on conversations.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    Task<BulkOperationResult> BulkDeleteConversationsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs bulk delete on contacts.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The bulk delete request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Bulk operation result.</returns>
    Task<BulkOperationResult> BulkDeleteContactsAsync(
        Guid businessId,
        BulkDeleteRequest request,
        CancellationToken cancellationToken = default);
}

