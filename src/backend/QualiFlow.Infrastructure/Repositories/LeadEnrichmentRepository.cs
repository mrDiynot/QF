// -----------------------------------------------------------------------
// <copyright file="LeadEnrichmentRepository.cs" company="QualiFlow">
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
/// Repository implementation for lead enrichment operations.
/// </summary>
public sealed partial class LeadEnrichmentRepository(
    QualiFlowDbContext context,
    ILogger<LeadEnrichmentRepository> logger) : ILeadEnrichmentRepository
{
    /// <inheritdoc />
    public async Task<LeadEnrichment?> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        LogGettingEnrichment(leadId);
        return await context.LeadEnrichments
            .AsNoTracking()
            .Where(e => e.LeadId == leadId && e.DeletedAt == null)
            .OrderByDescending(e => e.EnrichedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<LeadEnrichment?> GetByLeadIdAndSourceAsync(Guid leadId, string source, CancellationToken cancellationToken = default)
    {
        return await context.LeadEnrichments
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.LeadId == leadId && e.Source == source && e.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<LeadEnrichment> CreateAsync(LeadEnrichment enrichment, CancellationToken cancellationToken = default)
    {
        LogCreatingEnrichment(enrichment.LeadId, enrichment.Source);
        context.LeadEnrichments.Add(enrichment);
        await context.SaveChangesAsync(cancellationToken);
        return enrichment;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(LeadEnrichment enrichment, CancellationToken cancellationToken = default)
    {
        enrichment.UpdatedAt = DateTime.UtcNow;
        context.LeadEnrichments.Update(enrichment);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<Guid>> GetLeadsNeedingRefreshAsync(int maxResults = 100, CancellationToken cancellationToken = default)
    {
        var cutoffDate = DateTime.UtcNow;
        return await context.LeadEnrichments
            .AsNoTracking()
            .Where(e => e.DeletedAt == null && e.ExpiresAt != null && e.ExpiresAt <= cutoffDate)
            .Select(e => e.LeadId)
            .Distinct()
            .Take(maxResults)
            .ToListAsync(cancellationToken);
    }

    // Logging
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting enrichment for lead {LeadId}")]
    private partial void LogGettingEnrichment(Guid leadId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating enrichment for lead {LeadId} from source {Source}")]
    private partial void LogCreatingEnrichment(Guid leadId, string source);
}
