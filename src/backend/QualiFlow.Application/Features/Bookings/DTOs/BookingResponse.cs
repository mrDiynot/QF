using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Bookings.DTOs;

/// <summary>
/// Response DTO for booking.
/// </summary>
public record BookingResponse
{
    /// <summary>
    /// Gets the booking ID.
    /// </summary>
    public Guid Id { get; init; }

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
    public int DurationMinutes { get; init; }

    /// <summary>
    /// Gets the timezone.
    /// </summary>
    public string Timezone { get; init; } = "UTC";

    /// <summary>
    /// Gets the booking status.
    /// </summary>
    public BookingStatus Status { get; init; }

    /// <summary>
    /// Gets the Cal.com event type ID.
    /// </summary>
    public string? CalComEventTypeId { get; init; }

    /// <summary>
    /// Gets the Cal.com booking UID.
    /// </summary>
    public string? CalComBookingUid { get; init; }

    /// <summary>
    /// Gets the meeting link.
    /// </summary>
    public string? MeetingLink { get; init; }

    /// <summary>
    /// Gets the confirmation sent timestamp.
    /// </summary>
    public DateTime? ConfirmationSentAt { get; init; }

    /// <summary>
    /// Gets the reminder sent timestamp.
    /// </summary>
    public DateTime? ReminderSentAt { get; init; }

    /// <summary>
    /// Gets the cancellation reason.
    /// </summary>
    public string? CancellationReason { get; init; }

    /// <summary>
    /// Gets the cancelled timestamp.
    /// </summary>
    public DateTime? CancelledAt { get; init; }

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}

