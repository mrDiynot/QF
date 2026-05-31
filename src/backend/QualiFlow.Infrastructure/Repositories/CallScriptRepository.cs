// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for call script operations.
/// </summary>
public class CallScriptRepository : ICallScriptRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="CallScriptRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public CallScriptRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<CallScript?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.CallScripts
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<CallScript?> GetDefaultAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        return await _context.CallScripts
            .Where(s => s.BusinessId == businessId && s.IsDefault && s.IsActive)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<CallScript>> GetAllAsync(
        Guid businessId,
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CallScripts
            .Where(s => s.BusinessId == businessId);

        if (!includeInactive)
        {
            query = query.Where(s => s.IsActive);
        }

        return await query
            .OrderByDescending(s => s.IsDefault)
            .ThenBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task AddAsync(CallScript script, CancellationToken cancellationToken = default)
    {
        await _context.CallScripts.AddAsync(script, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(CallScript script, CancellationToken cancellationToken = default)
    {
        _context.CallScripts.Update(script);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(CallScript script, CancellationToken cancellationToken = default)
    {
        script.DeletedAt = DateTime.UtcNow;
        script.IsActive = false;
        _context.CallScripts.Update(script);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task ClearDefaultAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        var defaultScripts = await _context.CallScripts
            .Where(s => s.BusinessId == businessId && s.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var script in defaultScripts)
        {
            script.IsDefault = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}

