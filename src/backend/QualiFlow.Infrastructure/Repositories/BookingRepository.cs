using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Booking entity operations.
/// </summary>
public class BookingRepository : IBookingRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="BookingRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BookingRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Bookings
            .Include(b => b.Lead)
            .Include(b => b.AssignedToUser)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<Booking>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.AssignedToUser)
            .Where(b => b.LeadId == leadId)
            .OrderByDescending(b => b.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<Booking>> GetByUserIdAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Bookings
            .Include(b => b.Lead)
            .Where(b => b.AssignedToUserId == userId);

        if (from.HasValue)
        {
            query = query.Where(b => b.ScheduledAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(b => b.ScheduledAt <= to.Value);
        }

        return await query
            .OrderBy(b => b.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<Booking>> GetByStatusAsync(Guid businessId, BookingStatus status, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Lead)
            .Include(b => b.AssignedToUser)
            .Where(b => b.BusinessId == businessId && b.Status == status)
            .OrderBy(b => b.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<Booking>> GetUpcomingForRemindersAsync(DateTime reminderThreshold, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Lead)
            .Include(b => b.AssignedToUser)
            .Where(b => b.Status == BookingStatus.Confirmed
                && b.ReminderSentAt == null
                && b.ScheduledAt <= reminderThreshold
                && b.ScheduledAt > DateTime.UtcNow)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<Booking>> GetUpcomingBookingsAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        return await _context.Bookings
            .Include(b => b.Lead)
            .Include(b => b.AssignedToUser)
            .Where(b => b.ScheduledAt >= from && b.ScheduledAt <= to)
            .OrderBy(b => b.ScheduledAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        await _context.Bookings.AddAsync(booking, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        _context.Bookings.Update(booking);
        return _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public Task DeleteAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        _context.Bookings.Remove(booking);
        return _context.SaveChangesAsync(cancellationToken);
    }
}

