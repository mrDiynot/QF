// -----------------------------------------------------------------------
// <copyright file="BusinessKnowledgeBaseRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for business knowledge base operations.
/// </summary>
public sealed partial class BusinessKnowledgeBaseRepository(
    QualiFlowDbContext context,
    ILogger<BusinessKnowledgeBaseRepository> logger) : IBusinessKnowledgeBaseRepository
{
    /// <inheritdoc />
    public async Task<IReadOnlyList<BusinessKnowledgeBase>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        LogGettingEntries(businessId);
        return await context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(e => e.BusinessId == businessId && e.DeletedAt == null && e.IsActive)
            .OrderBy(e => e.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<BusinessKnowledgeBase>> GetByTypeAsync(Guid businessId, KnowledgeEntryType type, CancellationToken cancellationToken = default)
    {
        return await context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(e => e.BusinessId == businessId && e.EntryType == type && e.DeletedAt == null && e.IsActive)
            .OrderBy(e => e.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<BusinessKnowledgeBase?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.BusinessKnowledgeBases
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id && e.DeletedAt == null, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<BusinessKnowledgeBase> CreateAsync(BusinessKnowledgeBase entry, CancellationToken cancellationToken = default)
    {
        LogCreatingEntry(entry.BusinessId, entry.EntryType.ToString());
        context.BusinessKnowledgeBases.Add(entry);
        await context.SaveChangesAsync(cancellationToken);
        return entry;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(BusinessKnowledgeBase entry, CancellationToken cancellationToken = default)
    {
        entry.UpdatedAt = DateTime.UtcNow;
        context.BusinessKnowledgeBases.Update(entry);
        await context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entry = await context.BusinessKnowledgeBases.FindAsync([id], cancellationToken);
        if (entry != null)
        {
            entry.DeletedAt = DateTime.UtcNow;
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<BusinessKnowledgeBase>> SearchAsync(Guid businessId, string query, CancellationToken cancellationToken = default)
    {
        var searchPattern = $"%{query}%";
        return await context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(e => e.BusinessId == businessId && e.DeletedAt == null && e.IsActive &&
                (EF.Functions.ILike(e.Title, searchPattern) ||
                 EF.Functions.ILike(e.Content, searchPattern) ||
                 (e.Keywords != null && EF.Functions.ILike(e.Keywords, searchPattern))))
            .OrderByDescending(e => e.Priority)
            .Take(20)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<BusinessKnowledgeBase>> GetForAIContextAsync(Guid businessId, int maxEntries = 10, CancellationToken cancellationToken = default)
    {
        LogGettingAIContext(businessId, maxEntries);
        return await context.BusinessKnowledgeBases
            .AsNoTracking()
            .Where(e => e.BusinessId == businessId && e.DeletedAt == null && e.IsActive)
            .OrderByDescending(e => e.Priority)
            .ThenBy(e => e.DisplayOrder)
            .Take(maxEntries)
            .ToListAsync(cancellationToken);
    }

    // Logging
    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting knowledge entries for business {BusinessId}")]
    private partial void LogGettingEntries(Guid businessId);

    [LoggerMessage(Level = LogLevel.Information, Message = "Creating knowledge entry for business {BusinessId}, type: {EntryType}")]
    private partial void LogCreatingEntry(Guid businessId, string entryType);

    [LoggerMessage(Level = LogLevel.Debug, Message = "Getting AI context entries for business {BusinessId}, max: {MaxEntries}")]
    private partial void LogGettingAIContext(Guid businessId, int maxEntries);
}
