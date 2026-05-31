using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ConversationNote entity operations.
/// </summary>
public class ConversationNoteRepository : IConversationNoteRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="ConversationNoteRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public ConversationNoteRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public Task<ConversationNote?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.ConversationNotes
            .Include(n => n.CreatedByUser)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<ConversationNote>> GetByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return await _context.ConversationNotes
            .Include(n => n.CreatedByUser)
            .Where(n => n.ConversationId == conversationId)
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<ConversationNote>> GetPinnedByConversationIdAsync(Guid conversationId, CancellationToken cancellationToken = default)
    {
        return await _context.ConversationNotes
            .Include(n => n.CreatedByUser)
            .Where(n => n.ConversationId == conversationId && n.IsPinned)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task AddAsync(ConversationNote note, CancellationToken cancellationToken = default)
    {
        await _context.ConversationNotes.AddAsync(note, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task UpdateAsync(ConversationNote note, CancellationToken cancellationToken = default)
    {
        _context.ConversationNotes.Update(note);
        return _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task DeleteAsync(ConversationNote note, CancellationToken cancellationToken = default)
    {
        _context.ConversationNotes.Remove(note);
        return _context.SaveChangesAsync(cancellationToken);
    }
}

