// -----------------------------------------------------------------------
// <copyright file="ScoringCriteriaRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for scoring criteria operations.
/// </summary>
public class ScoringCriteriaRepository : IScoringCriteriaRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>Initializes a new instance of the <see cref="ScoringCriteriaRepository"/> class.</summary>
    /// <param name="context">The database context.</param>
    public ScoringCriteriaRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoringCriteria>> GetByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ScoringCriteria
            .AsNoTracking()
            .Where(sc => sc.BusinessId == businessId && sc.IsActive)
            .OrderBy(sc => sc.DisplayOrder)
            .ThenBy(sc => sc.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<ScoringCriteria>> GetAllByBusinessIdAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ScoringCriteria
            .AsNoTracking()
            .Where(sc => sc.BusinessId == businessId)
            .OrderBy(sc => sc.DisplayOrder)
            .ThenBy(sc => sc.Name)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public Task<ScoringCriteria?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _context.ScoringCriteria
            .FirstOrDefaultAsync(sc => sc.Id == id, cancellationToken);
    }

    /// <inheritdoc />
    public Task<ScoringCriteria?> GetByNameAsync(
        Guid businessId,
        string name,
        CancellationToken cancellationToken = default)
    {
        return _context.ScoringCriteria
            .AsNoTracking()
            .FirstOrDefaultAsync(
                sc => sc.BusinessId == businessId &&
                      sc.Name.Equals(name, StringComparison.OrdinalIgnoreCase),
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task<ScoringCriteria> CreateAsync(
        ScoringCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        criteria.CreatedAt = DateTime.UtcNow;
        _context.ScoringCriteria.Add(criteria);
        await _context.SaveChangesAsync(cancellationToken);
        return criteria;
    }

    /// <inheritdoc />
    public async Task<ScoringCriteria> UpdateAsync(
        ScoringCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        criteria.UpdatedAt = DateTime.UtcNow;
        _context.ScoringCriteria.Update(criteria);
        await _context.SaveChangesAsync(cancellationToken);
        return criteria;
    }

    /// <inheritdoc />
    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var criteria = await _context.ScoringCriteria.FindAsync([id], cancellationToken);
        if (criteria != null)
        {
            _context.ScoringCriteria.Remove(criteria);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task<bool> ValidateWeightsSumAsync(
        Guid businessId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var totalWeight = await GetTotalWeightAsync(businessId, excludeId, cancellationToken);
        return totalWeight == 100;
    }

    /// <inheritdoc />
    public Task<int> GetTotalWeightAsync(
        Guid businessId,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ScoringCriteria
            .Where(sc => sc.BusinessId == businessId && sc.IsActive);

        if (excludeId.HasValue)
        {
            query = query.Where(sc => sc.Id != excludeId.Value);
        }

        return query.SumAsync(sc => sc.Weight, cancellationToken);
    }
}

