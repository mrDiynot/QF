// <copyright file="IGlobalSearchService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Search.DTOs;

namespace QualiFlow.Application.Features.Search.Services;

/// <summary>
/// Service interface for global search across all entities.
/// </summary>
public interface IGlobalSearchService
{
    /// <summary>
    /// Performs a global search across leads, conversations, messages, contacts, and deals.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Paginated search results.</returns>
    Task<GlobalSearchResponse> SearchAsync(
        Guid businessId,
        GlobalSearchRequest request,
        CancellationToken cancellationToken = default);
}

