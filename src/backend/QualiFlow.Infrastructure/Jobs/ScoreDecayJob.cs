// -----------------------------------------------------------------------
// <copyright file="ScoreDecayJob.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Hangfire job for applying score decay to leads that haven't had recent activity.
/// </summary>
public sealed partial class ScoreDecayJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IBusinessScoringConfigurationRepository _configRepository;
    private readonly IScoreHistoryRepository _scoreHistoryRepository;
    private readonly ILogger<ScoreDecayJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ScoreDecayJob"/> class.
    /// </summary>
    public ScoreDecayJob(
        QualiFlowDbContext context,
        IBusinessScoringConfigurationRepository configRepository,
        IScoreHistoryRepository scoreHistoryRepository,
        ILogger<ScoreDecayJob> logger)
    {
        _context = context;
        _configRepository = configRepository;
        _scoreHistoryRepository = scoreHistoryRepository;
        _logger = logger;
    }

    /// <summary>
    /// Executes the score decay job for all businesses.
    /// This should be scheduled to run daily via Hangfire.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        LogJobStarted();

        var businesses = await _context.Businesses
            .Where(b => b.DeletedAt == null)
            .Select(b => b.Id)
            .ToListAsync(cancellationToken);

        var totalDecayed = 0;

        foreach (var businessId in businesses)
        {
            var decayedCount = await ProcessBusinessScoreDecayAsync(businessId, cancellationToken);
            totalDecayed += decayedCount;
        }

        LogJobCompleted(totalDecayed);
    }

    private async Task<int> ProcessBusinessScoreDecayAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var config = await _configRepository.GetByBusinessIdAsync(businessId, cancellationToken);

        // Skip if no config or decay is disabled
        if (config == null || config.ScoreDecayDays <= 0 || config.ScoreDecayPercentage <= 0)
        {
            return 0;
        }

        var decayThreshold = DateTime.UtcNow.AddDays(-config.ScoreDecayDays);

        // Find leads that haven't had activity since the decay threshold
        var leadsToDecay = await _context.Leads
            .Where(l => l.BusinessId == businessId)
            .Where(l => l.DeletedAt == null)
            .Where(l => l.Score > 0)
            .Where(l => l.UpdatedAt < decayThreshold)
            .ToListAsync(cancellationToken);

        if (leadsToDecay.Count == 0)
        {
            return 0;
        }

        LogDecayingLeads(businessId, leadsToDecay.Count, config.ScoreDecayPercentage);

        var decayMultiplier = 1 - (config.ScoreDecayPercentage / 100m);

        foreach (var lead in leadsToDecay)
        {
            var previousScore = lead.Score;
            var newScore = Math.Max(0, (int)(lead.Score * decayMultiplier));

            if (newScore != previousScore)
            {
                lead.Score = newScore;
                lead.UpdatedAt = DateTime.UtcNow;

                // Record in score history
                var historyEntry = new ScoreHistory
                {
                    Id = Guid.NewGuid(),
                    LeadId = lead.Id,
                    Score = newScore,
                    PreviousScore = previousScore,
                    ScoreChange = newScore - previousScore,
                    Source = "ScoreDecay",
                    Reason = $"Inactivity decay ({config.ScoreDecayPercentage}% after {config.ScoreDecayDays} days)",
                    ScoredAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                };

                await _scoreHistoryRepository.CreateAsync(historyEntry, cancellationToken);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return leadsToDecay.Count;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Score decay job started")]
    private partial void LogJobStarted();

    [LoggerMessage(Level = LogLevel.Information, Message = "Score decay job completed. Total leads decayed: {Count}")]
    private partial void LogJobCompleted(int count);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Decaying {Count} leads for business {BusinessId} by {Percentage}%")]
    private partial void LogDecayingLeads(Guid businessId, int count, int percentage);
}
