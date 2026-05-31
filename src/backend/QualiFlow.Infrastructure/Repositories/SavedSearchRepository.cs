// <copyright file="SavedSearchRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Features.Search.Repositories;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for SavedSearch entity (S15-BE-003).
/// </summary>
public class SavedSearchRepository(QualiFlowDbContext context) : ISavedSearchRepository
{
    /// <inheritdoc/>
    public async Task<SavedSearch?> GetByIdAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        return await context.SavedSearches
            .AsNoTracking()
            .FirstOrDefaultAsync(
                s => s.Id == id && s.BusinessId == businessId,
                cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SavedSearch>> GetAllAsync(
        Guid businessId,
        Guid userId,
        bool includeShared = true,
        CancellationToken cancellationToken = default)
    {
        var query = context.SavedSearches
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId);

        if (includeShared)
        {
            // Return user's own searches + shared searches from other users
            query = query.Where(s => s.UserId == userId || s.IsShared);
        }
        else
        {
            // Return only user's own searches
            query = query.Where(s => s.UserId == userId);
        }

        return await query
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<SavedSearch>> GetByEntityTypeAsync(
        Guid businessId,
        Guid userId,
        string entityType,
        CancellationToken cancellationToken = default)
    {
        return await context.SavedSearches
            .AsNoTracking()
            .Where(s => s.BusinessId == businessId &&
                       (s.UserId == userId || s.IsShared) &&
                       s.EntityType == entityType)
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<SavedSearch> CreateAsync(
        SavedSearch savedSearch,
        CancellationToken cancellationToken = default)
    {
        savedSearch.CreatedAt = DateTime.UtcNow;
        savedSearch.UsageCount = 0;

        await context.SavedSearches.AddAsync(savedSearch, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        return savedSearch;
    }

    /// <inheritdoc/>
    public async Task<SavedSearch> UpdateAsync(
        SavedSearch savedSearch,
        CancellationToken cancellationToken = default)
    {
        savedSearch.UpdatedAt = DateTime.UtcNow;

        context.SavedSearches.Update(savedSearch);
        await context.SaveChangesAsync(cancellationToken);

        return savedSearch;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var savedSearch = await context.SavedSearches
            .FirstOrDefaultAsync(
                s => s.Id == id && s.BusinessId == businessId,
                cancellationToken);

        if (savedSearch == null)
        {
            return false;
        }

        context.SavedSearches.Remove(savedSearch);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <inheritdoc/>
    public async Task IncrementUsageAsync(
        Guid id,
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var savedSearch = await context.SavedSearches
            .FirstOrDefaultAsync(
                s => s.Id == id && s.BusinessId == businessId,
                cancellationToken);

        if (savedSearch != null)
        {
            savedSearch.UsageCount++;
            savedSearch.LastUsedAt = DateTime.UtcNow;
            savedSearch.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}

