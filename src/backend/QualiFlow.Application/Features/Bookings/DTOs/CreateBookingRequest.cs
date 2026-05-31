namespace QualiFlow.Application.Features.Bookings.DTOs;

/// <summary>
/// Request DTO for creating a booking.
/// </summary>
public record CreateBookingRequest
{
    /// <summary>
    /// Gets the lead ID.
    /// </summary>
    public Guid LeadId { get; init; }

    /// <summary>
    /// Gets the conversation ID.
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Gets the assigned user ID.
    /// </summary>
    public Guid? AssignedToUserId { get; init; }

    /// <summary>
    /// Gets the booking title.
    /// </summary>
    public string Title { get; init; } = string.Empty;

    /// <summary>
    /// Gets the booking description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the scheduled date and time.
    /// </summary>
    public DateTime ScheduledAt { get; init; }

    /// <summary>
    /// Gets the duration in minutes.
    /// </summary>
    public int DurationMinutes { get; init; } = 30;

    /// <summary>
    /// Gets the timezone.
    /// </summary>
    public string Timezone { get; init; } = "UTC";

    /// <summary>
    /// Gets the Cal.com event type ID.
    /// </summary>
    public string? CalComEventTypeId { get; init; }
}

