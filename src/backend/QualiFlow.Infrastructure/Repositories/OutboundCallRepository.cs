// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Common.Models;
using QualiFlow.Application.Features.OutboundCalls.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for outbound call operations.
/// </summary>
public class OutboundCallRepository : IOutboundCallRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="OutboundCallRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public OutboundCallRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<OutboundCall?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.OutboundCalls
            .Include(c => c.Lead)
            .Include(c => c.CallScript)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<OutboundCall?> GetByTwilioCallSidAsync(string callSid, CancellationToken cancellationToken = default)
    {
        return await _context.OutboundCalls
            .Include(c => c.Lead)
            .Include(c => c.CallScript)
            .FirstOrDefaultAsync(c => c.TwilioCallSid == callSid, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<PagedResult<OutboundCall>> GetPagedAsync(
        Guid businessId,
        OutboundCallListQuery query,
        CancellationToken cancellationToken = default)
    {
        var queryable = _context.OutboundCalls
            .Include(c => c.Lead)
            .Include(c => c.CallScript)
            .Where(c => c.BusinessId == businessId);

        // Apply filters
        if (query.LeadId.HasValue)
        {
            queryable = queryable.Where(c => c.LeadId == query.LeadId.Value);
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(c => c.Status == query.Status.Value);
        }

        if (query.Outcome.HasValue)
        {
            queryable = queryable.Where(c => c.Outcome == query.Outcome.Value);
        }

        if (query.FromDate.HasValue)
        {
            queryable = queryable.Where(c => c.CreatedAt >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            queryable = queryable.Where(c => c.CreatedAt <= query.ToDate.Value);
        }

        // Apply sorting
        queryable = query.SortBy.ToUpperInvariant() switch
        {
            "SCHEDULEDAT" => query.SortDescending
                ? queryable.OrderByDescending(c => c.ScheduledAt)
                : queryable.OrderBy(c => c.ScheduledAt),
            "STATUS" => query.SortDescending
                ? queryable.OrderByDescending(c => c.Status)
                : queryable.OrderBy(c => c.Status),
            "DURATIONSECONDS" => query.SortDescending
                ? queryable.OrderByDescending(c => c.DurationSeconds)
                : queryable.OrderBy(c => c.DurationSeconds),
            _ => query.SortDescending
                ? queryable.OrderByDescending(c => c.CreatedAt)
                : queryable.OrderBy(c => c.CreatedAt),
        };

        var totalItems = await queryable.CountAsync(cancellationToken);
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<OutboundCall>
        {
            Items = items,
            TotalItems = totalItems,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<OutboundCall>> GetScheduledCallsDueAsync(
        DateTime beforeTime,
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        return await _context.OutboundCalls
            .Include(c => c.Lead)
            .Include(c => c.CallScript)
            .Where(c => c.Status == OutboundCallStatus.Scheduled
                && c.ScheduledAt.HasValue
                && c.ScheduledAt.Value <= beforeTime)
            .OrderBy(c => c.ScheduledAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<OutboundCall>> GetCallsNeedingRetryAsync(
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        return await _context.OutboundCalls
            .Include(c => c.Lead)
            .Include(c => c.CallScript)
            .Where(c => c.Status == OutboundCallStatus.Failed
                && c.RetryAttempt < c.MaxRetries)
            .OrderBy(c => c.UpdatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<OutboundCallStatistics> GetStatisticsAsync(
        Guid businessId,
        DateTime fromDate,
        DateTime toDate,
        CancellationToken cancellationToken = default)
    {
        var calls = await _context.OutboundCalls
            .Where(c => c.BusinessId == businessId
                && c.CreatedAt >= fromDate
                && c.CreatedAt <= toDate)
            .ToListAsync(cancellationToken);

        var totalCalls = calls.Count;
        var completedCalls = calls.Count(c => c.Status == OutboundCallStatus.Completed);
        var connectedCalls = calls.Count(c => c.Outcome == OutboundCallOutcome.Connected);
        var voicemailCalls = calls.Count(c => c.Outcome == OutboundCallOutcome.Voicemail);
        var failedCalls = calls.Count(c => c.Status == OutboundCallStatus.Failed);
        var avgDuration = calls
            .Where(c => c.DurationSeconds.HasValue)
            .Select(c => c.DurationSeconds!.Value)
            .DefaultIfEmpty(0)
            .Average();

        return new OutboundCallStatistics
        {
            TotalCalls = totalCalls,
            CompletedCalls = completedCalls,
            ConnectedCalls = connectedCalls,
            VoicemailCalls = voicemailCalls,
            FailedCalls = failedCalls,
            AverageDurationSeconds = avgDuration,
            ConnectionRate = totalCalls > 0 ? (double)connectedCalls / totalCalls : 0,
        };
    }

    /// <inheritdoc />
    public async Task AddAsync(OutboundCall call, CancellationToken cancellationToken = default)
    {
        await _context.OutboundCalls.AddAsync(call, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(OutboundCall call, CancellationToken cancellationToken = default)
    {
        _context.OutboundCalls.Update(call);
        await _context.SaveChangesAsync(cancellationToken);
    }
}

