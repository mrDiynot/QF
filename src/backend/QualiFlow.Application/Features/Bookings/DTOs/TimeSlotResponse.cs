namespace QualiFlow.Application.Features.Bookings.DTOs;

/// <summary>
/// Response DTO for available time slot.
/// </summary>
public record TimeSlotResponse
{
    /// <summary>
    /// Gets the start time.
    /// </summary>
    public DateTime StartTime { get; init; }

    /// <summary>
    /// Gets the end time.
    /// </summary>
    public DateTime EndTime { get; init; }

    /// <summary>
    /// Gets a value indicating whether the slot is available.
    /// </summary>
    public bool IsAvailable { get; init; }
}

