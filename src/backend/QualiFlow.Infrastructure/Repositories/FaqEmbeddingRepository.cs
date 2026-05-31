// -----------------------------------------------------------------------
// <copyright file="FaqEmbeddingRepository.cs" company="QualiFlow">
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
/// Repository implementation for FAQ embeddings with semantic search.
/// </summary>
public sealed class FaqEmbeddingRepository : IFaqEmbeddingRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="FaqEmbeddingRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public FaqEmbeddingRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc />
    public async Task<FaqEmbedding?> GetByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.FaqEmbeddings
            .Where(f => f.BusinessId == businessId && f.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<FaqEmbedding>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        return await _context.FaqEmbeddings
            .Where(f => f.BusinessId == businessId && f.IsActive)
            .OrderBy(f => f.Category)
            .ThenBy(f => f.Question)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<(FaqEmbedding faq, float similarity)>> SearchSimilarAsync(
        Guid businessId,
        Vector queryEmbedding,
        int limit = 5,
        float minSimilarity = 0.7f,
        CancellationToken cancellationToken = default)
    {
        // Use cosine distance for similarity: 1 - distance = similarity
        // pgvector's <=> operator returns cosine distance (0 = identical, 2 = opposite)
        var results = await _context.FaqEmbeddings
            .Where(f => f.BusinessId == businessId && f.IsActive && f.Embedding != null)
            .Select(f => new
            {
                faq = f,
                distance = f.Embedding!.CosineDistance(queryEmbedding)
            })
            .OrderBy(x => x.distance)
            .Take(limit)
            .ToListAsync(cancellationToken);

        // Convert distance to similarity and filter by threshold
        return results
            .Select(x => (x.faq, similarity: 1.0f - (float)x.distance))
            .Where(x => x.similarity >= minSimilarity)
            .ToList();
    }

    /// <inheritdoc />
    public async Task AddAsync(FaqEmbedding faq, CancellationToken cancellationToken = default)
    {
        await _context.FaqEmbeddings.AddAsync(faq, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(FaqEmbedding faq, CancellationToken cancellationToken = default)
    {
        _context.FaqEmbeddings.Update(faq);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(Guid businessId, Guid id, CancellationToken cancellationToken = default)
    {
        var faq = await GetByIdAsync(businessId, id, cancellationToken);
        if (faq != null)
        {
            _context.FaqEmbeddings.Remove(faq);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
