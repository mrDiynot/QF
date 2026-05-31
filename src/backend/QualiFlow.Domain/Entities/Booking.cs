using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a scheduled booking/appointment with a lead.
/// </summary>
public class Booking : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID this booking is for.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID that initiated this booking.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the assigned agent's user ID.
    /// </summary>
    public Guid? AssignedToUserId { get; set; }

    /// <summary>
    /// Gets or sets the booking title/subject.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the booking description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets when the booking is scheduled.
    /// </summary>
    public DateTime ScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets the booking duration in minutes.
    /// </summary>
    public int Duration { get; set; } = 30;

    /// <summary>
    /// Gets or sets the booking status.
    /// </summary>
    public BookingStatus Status { get; set; } = BookingStatus.Scheduled;

    /// <summary>
    /// Gets or sets the meeting URL (for virtual meetings).
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Stored as string in database for flexibility")]
    public string? MeetingUrl { get; set; }

    /// <summary>
    /// Gets or sets the Cal.com event type ID.
    /// </summary>
    public string? CalComEventTypeId { get; set; }

    /// <summary>
    /// Gets or sets the Cal.com booking UID.
    /// </summary>
    public string? CalComBookingUid { get; set; }

    /// <summary>
    /// Gets or sets the timezone for the booking.
    /// </summary>
    public string Timezone { get; set; } = "UTC";

    /// <summary>
    /// Gets or sets when the confirmation was sent.
    /// </summary>
    public DateTime? ConfirmationSentAt { get; set; }

    /// <summary>
    /// Gets or sets when the reminder was sent.
    /// </summary>
    public DateTime? ReminderSentAt { get; set; }

    /// <summary>
    /// Gets or sets the cancellation reason if cancelled.
    /// </summary>
    public string? CancellationReason { get; set; }

    /// <summary>
    /// Gets or sets when the booking was cancelled.
    /// </summary>
    public DateTime? CancelledAt { get; set; }

    /// <summary>
    /// Gets or sets additional notes for the booking.
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this booking belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead this booking is for.
    /// </summary>
    public Lead Lead { get; set; } = null!;

    /// <summary>
    /// Gets or sets the conversation that initiated this booking.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the assigned agent.
    /// </summary>
    public ApplicationUser? AssignedToUser { get; set; }
}

