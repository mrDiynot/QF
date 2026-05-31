using System.ComponentModel.DataAnnotations;

namespace QualiFlow.Application.Features.Onboarding.DTOs;

#pragma warning disable SA1649 // File name should match first type name - multiple related DTOs in one file

/// <summary>
/// Request to book an onboarding call.
/// </summary>
public record BookOnboardingCallRequest
{
    /// <summary>
    /// Gets the selected time slot (ISO 8601 datetime).
    /// </summary>
    [Required]
    public required DateTime ScheduledAt { get; init; }

    /// <summary>
    /// Gets the timezone (e.g., "America/New_York").
    /// </summary>
    public string Timezone { get; init; } = "UTC";

    /// <summary>
    /// Gets optional notes for the call.
    /// </summary>
    public string? Notes { get; init; }
}

/// <summary>
/// Response for booking an onboarding call.
/// </summary>
public record BookOnboardingCallResponse
{
    /// <summary>
    /// Gets a value indicating whether the booking was successful.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the Cal.com booking UID.
    /// </summary>
    public string? BookingUid { get; init; }

    /// <summary>
    /// Gets the scheduled date and time.
    /// </summary>
    public DateTime? ScheduledAt { get; init; }

    /// <summary>
    /// Gets an error message if the booking failed.
    /// </summary>
    public string? ErrorMessage { get; init; }
}

/// <summary>
/// Request to reschedule an onboarding call.
/// </summary>
public record RescheduleOnboardingCallRequest
{
    /// <summary>
    /// Gets the new time slot (ISO 8601 datetime).
    /// </summary>
    [Required]
    public required DateTime NewScheduledAt { get; init; }

    /// <summary>
    /// Gets the reason for rescheduling.
    /// </summary>
    public string? Reason { get; init; }
}

/// <summary>
/// Request to cancel an onboarding call.
/// </summary>
public record CancelOnboardingCallRequest
{
    /// <summary>
    /// Gets the reason for cancelling.
    /// </summary>
    public string? Reason { get; init; }
}

/// <summary>
/// Response for available time slots.
/// </summary>
public record OnboardingCallSlotResponse
{
    /// <summary>
    /// Gets the start time of the slot.
    /// </summary>
    public DateTime StartTime { get; init; }

    /// <summary>
    /// Gets the end time of the slot.
    /// </summary>
    public DateTime EndTime { get; init; }

    /// <summary>
    /// Gets a value indicating whether the slot is available.
    /// </summary>
    public bool IsAvailable { get; init; }
}

/// <summary>
/// Response containing available slots for the next 2 weeks.
/// </summary>
public record AvailableSlotsResponse
{
    /// <summary>
    /// Gets the list of available slots.
    /// </summary>
    public IReadOnlyList<OnboardingCallSlotResponse> Slots { get; init; } = [];
}

#pragma warning restore SA1649

