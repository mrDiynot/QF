// -----------------------------------------------------------------------
// <copyright file="ScoreHistoryRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for score history operations.
/// </summary>
public sealed partial class ScoreHistoryRepository(
    QualiFlowDbContext context,
    ILogger<ScoreHistoryRepository> logger) : IScoreHistoryRepository
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoreHistory>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        LogGettingHistory(leadId);
        return await context.ScoreHistories
            .AsNoTracking()
            .Where(h => h.LeadId == leadId && h.DeletedAt == null)
            .OrderByDescending(h => h.ScoredAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ScoreHistory?> GetLatestByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await context.ScoreHistories
            .AsNoTracking()
            .Where(h => h.LeadId == leadId && h.DeletedAt == null)
            .OrderByDescending(h => h.ScoredAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ScoreHistory> CreateAsync(ScoreHistory entry, CancellationToken cancellationToken = default)
    {
        LogCreatingHistory(entry.LeadId, entry.Score, entry.PreviousScore);
        context.ScoreHistories.Add(entry);
        await context.SaveChangesAsync(cancellationToken);
        return entry;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoreHistory>> GetByDateRangeAsync(Guid leadId, DateTime start, DateTime end, CancellationToken cancellationToken = default)
    {
        return await context.ScoreHistories
            .AsNoTracking()
            .Where(h => h.LeadId == leadId && h.DeletedAt == null && h.ScoredAt >= start && h.ScoredAt <= end)
            .OrderByDescending(h => h.ScoredAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoreHistory>> GetByBusinessIdAsync(Guid businessId, int skip = 0, int take = 100, CancellationToken cancellationToken = default)
    {
        return await context.ScoreHistories
            .AsNoTracking()
            .Include(h => h.Lead)
            .Where(h => h.Lead.BusinessId == businessId && h.DeletedAt == null)
            .OrderByDescending(h => h.ScoredAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    // Logging
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting score history for lead {LeadId}")]
    private partial void LogGettingHistory(Guid leadId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating score history for lead {LeadId}: score={Score}, previous={PreviousScore}")]
    private partial void LogCreatingHistory(Guid leadId, int score, int? previousScore);
}
