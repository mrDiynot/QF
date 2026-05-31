using QualiFlow.Application.Features.Bookings.DTOs;

namespace QualiFlow.Application.Features.Bookings.Services;

/// <summary>
/// Service interface for booking operations.
/// </summary>
public interface IBookingService
{
    /// <summary>
    /// Gets a booking by ID.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The booking response if found, null otherwise.</returns>
    Task<BookingResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bookings for a lead.
    /// </summary>
    /// <param name="leadId">The lead ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of booking responses for the lead.</returns>
    Task<IReadOnlyList<BookingResponse>> GetByLeadIdAsync(Guid leadId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets bookings for the current user.
    /// </summary>
    /// <param name="from">Optional start date filter.</param>
    /// <param name="to">Optional end date filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of booking responses for the current user.</returns>
    Task<IReadOnlyList<BookingResponse>> GetMyBookingsAsync(DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available time slots.
    /// </summary>
    /// <param name="eventTypeId">The Cal.com event type ID.</param>
    /// <param name="startDate">The start date for availability.</param>
    /// <param name="endDate">The end date for availability.</param>
    /// <param name="timezone">The timezone for the slots.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of available time slots.</returns>
    Task<IReadOnlyList<TimeSlotResponse>> GetAvailableSlotsAsync(
        string eventTypeId,
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new booking.
    /// </summary>
    /// <param name="request">The create booking request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created booking response.</returns>
    Task<BookingResponse> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Confirms a booking.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The confirmed booking response if found, null otherwise.</returns>
    Task<BookingResponse?> ConfirmAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Reschedules a booking.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="request">The reschedule request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The rescheduled booking response if found, null otherwise.</returns>
    Task<BookingResponse?> RescheduleAsync(Guid id, RescheduleBookingRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a booking.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="request">The cancel request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The cancelled booking response if found, null otherwise.</returns>
    Task<BookingResponse?> CancelAsync(Guid id, CancelBookingRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a booking as completed.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The completed booking response if found, null otherwise.</returns>
    Task<BookingResponse?> CompleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Marks a booking as no-show.
    /// </summary>
    /// <param name="id">The booking ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The no-show booking response if found, null otherwise.</returns>
    Task<BookingResponse?> MarkNoShowAsync(Guid id, CancellationToken cancellationToken = default);
}

