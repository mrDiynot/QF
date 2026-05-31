// -----------------------------------------------------------------------
// <copyright file="IScoreHistoryRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for score history operations.
/// </summary>
public interface IScoreHistoryRepository
{
    /// <summary>
    /// Gets score history for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of score history entries.</returns>
    Task<IReadOnlyList<ScoreHistory>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the most recent score history entry for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The latest entry if found; otherwise, null.</returns>
    Task<ScoreHistory?> GetLatestByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new score history entry.
    /// </summary>
    /// <param name="entry">The entry to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created entry.</returns>
    Task<ScoreHistory> CreateAsync(ScoreHistory entry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets score history entries within a date range.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="start">Start date.</param>
    /// <param name="end">End date.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The list of entries within the range.</returns>
    Task<IReadOnlyList<ScoreHistory>> GetByDateRangeAsync(Guid leadId, DateTime start, DateTime end, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets score history for all leads of a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="skip">Number of entries to skip.</param>
    /// <param name="take">Number of entries to take.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The paginated list of entries.</returns>
    Task<IReadOnlyList<ScoreHistory>> GetByBusinessIdAsync(Guid businessId, int skip = 0, int take = 100, CancellationToken cancellationToken = default);
}
