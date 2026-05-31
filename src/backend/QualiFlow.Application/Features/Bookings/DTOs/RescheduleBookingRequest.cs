namespace QualiFlow.Application.Features.Bookings.DTOs;

/// <summary>
/// Request DTO for rescheduling a booking.
/// </summary>
public record RescheduleBookingRequest
{
    /// <summary>
    /// Gets the new scheduled date and time.
    /// </summary>
    public DateTime ScheduledAt { get; init; }

    /// <summary>
    /// Gets the new duration in minutes.
    /// </summary>
    public int? DurationMinutes { get; init; }

    /// <summary>
    /// Gets the reason for rescheduling.
    /// </summary>
    public string? Reason { get; init; }
}

