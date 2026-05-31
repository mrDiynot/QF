namespace QualiFlow.Application.Features.Bookings.DTOs;

/// <summary>
/// Request DTO for cancelling a booking.
/// </summary>
public record CancelBookingRequest
{
    /// <summary>
    /// Gets the cancellation reason.
    /// </summary>
    public string? Reason { get; init; }
}

