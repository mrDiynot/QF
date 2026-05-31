// -----------------------------------------------------------------------
// <copyright file="IAIInsightsService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI-powered business insights generation.
/// Analyzes lead data, conversations, and conversion patterns to provide
/// actionable insights for business owners.
/// </summary>
public interface IAIInsightsService
{
    /// <summary>
    /// Gets cached dashboard insights for quick display.
    /// Insights are cached for 1 hour per business to reduce costs.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Cached or freshly generated insights.</returns>
    Task<InsightsResult> GetDashboardInsightsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates custom insights for a specified date range and categories.
    /// This bypasses the cache and generates fresh insights.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The insights request with date range and options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Freshly generated insights.</returns>
    Task<InsightsResult> GenerateCustomInsightsAsync(
        Guid businessId,
        InsightsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Refreshes the cached dashboard insights for a business.
    /// Called by scheduled job or manual refresh.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The refreshed insights.</returns>
    Task<InsightsResult> RefreshDashboardInsightsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates the cached insights for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    void InvalidateCache(Guid businessId);
}

