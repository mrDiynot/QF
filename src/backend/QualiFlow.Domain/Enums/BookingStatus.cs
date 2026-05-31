namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a booking.
/// </summary>
public enum BookingStatus
{
    /// <summary>
    /// Booking is pending confirmation.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Booking has been scheduled but not confirmed.
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Booking has been confirmed by the lead.
    /// </summary>
    Confirmed = 2,

    /// <summary>
    /// Booking has been completed.
    /// </summary>
    Completed = 3,

    /// <summary>
    /// Booking has been cancelled.
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Booking has been rescheduled.
    /// </summary>
    Rescheduled = 5,

    /// <summary>
    /// Lead did not show up for the booking.
    /// </summary>
    NoShow = 6,
}

