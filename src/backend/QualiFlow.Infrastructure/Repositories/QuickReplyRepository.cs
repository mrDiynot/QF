using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for QuickReply entity operations.
/// </summary>
public class QuickReplyRepository : IQuickReplyRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="QuickReplyRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public QuickReplyRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public Task<QuickReply?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.QuickReplies
            .FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public Task<QuickReply?> GetByShortcutAsync(Guid businessId, string shortcut, CancellationToken cancellationToken = default)
    {
        return _context.QuickReplies
            .FirstOrDefaultAsync(q => q.BusinessId == businessId && q.Shortcut == shortcut, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<QuickReply>> GetAllAsync(Guid businessId, string? category = null, CancellationToken cancellationToken = default)
    {
        var query = _context.QuickReplies
            .Where(q => q.BusinessId == businessId);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(q => q.Category == category);
        }

        return await query
            .OrderBy(q => q.Shortcut)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task AddAsync(QuickReply quickReply, CancellationToken cancellationToken = default)
    {
        await _context.QuickReplies.AddAsync(quickReply, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task UpdateAsync(QuickReply quickReply, CancellationToken cancellationToken = default)
    {
        _context.QuickReplies.Update(quickReply);
        return _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task DeleteAsync(QuickReply quickReply, CancellationToken cancellationToken = default)
    {
        _context.QuickReplies.Remove(quickReply);
        return _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task IncrementUsageCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.QuickReplies
            .Where(q => q.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(q => q.UsageCount, q => q.UsageCount + 1), cancellationToken);
    }
}

