// -----------------------------------------------------------------------
// <copyright file="ConversationMemoryRepository.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for conversation memory with semantic search.
/// </summary>
public sealed class ConversationMemoryRepository : IConversationMemoryRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationMemoryRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public ConversationMemoryRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<ConversationMemory?> GetBySessionIdAsync(Guid businessId, Guid sessionId, CancellationToken cancellationToken = default)
    {
        return await _context.ConversationMemories
            .Where(m => m.BusinessId == businessId && m.SessionId == sessionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<ConversationMemory>> GetRecentMemoriesAsync(
        Guid businessId,
        Guid? leadId,
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ConversationMemories
            .Where(m => m.BusinessId == businessId);

        if (leadId.HasValue)
        {
            query = query.Where(m => m.LeadId == leadId.Value);
        }

        return await query
            .AsNoTracking()
            .OrderByDescending(m => m.ImportanceScore)
            .ThenByDescending(m => m.UpdatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<(ConversationMemory memory, float similarity)>> SearchSimilarAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        CancellationToken cancellationToken = default)
    {
        // Use cosine distance for similarity
        var results = await _context.ConversationMemories
            .AsNoTracking()
            .Where(m => m.BusinessId == businessId && m.Embedding != null)
            .Select(m => new
            {
                memory = m,
                distance = m.Embedding!.CosineDistance(queryEmbedding)
            })
            .OrderBy(x => x.distance)
            .Take(limit)
            .ToListAsync(cancellationToken);

        // Convert distance to similarity
        return results
            .Select(x => (x.memory, similarity: 1.0f - (float)x.distance))
            .ToList();
    }

    /// <inheritdoc />
    public async Task AddAsync(ConversationMemory memory, CancellationToken cancellationToken = default)
    {
        await _context.ConversationMemories.AddAsync(memory, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(ConversationMemory memory, CancellationToken cancellationToken = default)
    {
        _context.ConversationMemories.Update(memory);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
