// -----------------------------------------------------------------------
// <copyright file="ILeadScoringService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Scoring.DTOs;

namespace QualiFlow.Application.Features.Scoring.Interfaces;

/// <summary>
/// Service interface for lead scoring operations.
/// Combines AI-based scoring with business rules for comprehensive lead qualification.
/// </summary>
public interface ILeadScoringService
{
    /// <summary>
    /// Calculates a comprehensive score for a lead based on AI analysis and business rules.
    /// </summary>
    /// <param name="request">The scoring request with lead and business context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The calculated score with breakdown.</returns>
    Task<LeadScoreResult> CalculateScoreAsync(
        CalculateScoreRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates and updates a lead's score based on new information.
    /// </summary>
    /// <param name="leadId">The lead ID to recalculate.</param>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="trigger">The trigger for recalculation.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated score result.</returns>
    Task<LeadScoreResult> RecalculateScoreAsync(
        Guid leadId,
        Guid businessId,
        string trigger,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the score history for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="limit">Maximum number of history records to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of historical scores.</returns>
    Task<IReadOnlyList<ScoreHistoryDto>> GetScoreHistoryAsync(
        Guid leadId,
        Guid businessId,
        int limit = 10,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the scoring configuration for a business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The scoring configuration.</returns>
    Task<ScoringConfiguration> GetScoringConfigurationAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the scoring configuration for a business.
    /// </summary>
    /// <param name="businessId">The business (tenant) ID.</param>
    /// <param name="configuration">The new configuration.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated configuration.</returns>
    Task<ScoringConfiguration> UpdateScoringConfigurationAsync(
        Guid businessId,
        ScoringConfiguration configuration,
        CancellationToken cancellationToken = default);
}

