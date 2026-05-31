using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for Booking entity operations.
/// </summary>
public interface IBookingRepository
{
    /// <summary>
    /// Gets a booking by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The booking if found, null otherwise.</returns>
    Task<Booking?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bookings for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bookings for the lead.</returns>
    Task<IReadOnlyList<Booking>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bookings for a user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="from">Optional start date filter.</param>
    /// <param name="to">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bookings for the user.</returns>
    Task<IReadOnlyList<Booking>> GetByUserIdAsync(Guid userId, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bookings by status.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="status">The booking status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bookings with the specified status.</returns>
    Task<IReadOnlyList<Booking>> GetByStatusAsync(Guid businessId, BookingStatus status, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming bookings that need reminders.
    /// </summary>
    /// <param name="reminderThreshold">The threshold time for reminders.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of bookings needing reminders.</returns>
    Task<IReadOnlyList<Booking>> GetUpcomingForRemindersAsync(DateTime reminderThreshold, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets upcoming bookings within a time range.
    /// </summary>
    /// <param name="from">The start of the time range.</param>
    /// <param name="to">The end of the time range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of upcoming bookings.</returns>
    Task<IReadOnlyList<Booking>> GetUpcomingBookingsAsync(DateTime from, DateTime to, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new booking.
    /// </summary>
    /// <param name="booking">The booking to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing booking.
    /// </summary>
    /// <param name="booking">The booking to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task UpdateAsync(Booking booking, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a booking.
    /// </summary>
    /// <param name="booking">The booking to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task DeleteAsync(Booking booking, CancellationToken cancellationToken = default);
}

