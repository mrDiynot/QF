using QualiFlow.Application.Features.Bookings.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for Cal.com integration.
/// Each business has their own Cal.com API key stored in the database.
/// </summary>
public interface ICalComService
{
    /// <summary>
    /// Gets available time slots for a date range.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="eventTypeId">The Cal.com event type ID.</param>
    /// <param name="startDate">Start date.</param>
    /// <param name="endDate">End date.</param>
    /// <param name="timezone">Timezone.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available time slots.</returns>
    Task<IReadOnlyList<TimeSlotResponse>> GetAvailableSlotsAsync(
        Guid businessId,
        string eventTypeId,
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a booking in Cal.com.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="eventTypeId">The Cal.com event type ID.</param>
    /// <param name="startTime">Start time.</param>
    /// <param name="name">Attendee name.</param>
    /// <param name="email">Attendee email.</param>
    /// <param name="notes">Optional notes.</param>
    /// <param name="timezone">Timezone.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Cal.com booking UID.</returns>
    Task<string> CreateBookingAsync(
        Guid businessId,
        string eventTypeId,
        DateTime startTime,
        string name,
        string email,
        string? notes = null,
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reschedules a booking in Cal.com.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="newStartTime">New start time.</param>
    /// <param name="reason">Reason for rescheduling.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task RescheduleBookingAsync(
        Guid businessId,
        string bookingUid,
        DateTime newStartTime,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a booking in Cal.com.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="reason">Cancellation reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task CancelBookingAsync(
        Guid businessId,
        string bookingUid,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets event types for the connected Cal.com account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of event types.</returns>
    Task<IReadOnlyList<CalComEventType>> GetEventTypesAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates a Cal.com API key by making a test request.
    /// </summary>
    /// <param name="apiKey">The API key to validate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the API key is valid, false otherwise.</returns>
    Task<CalComValidationResult> ValidateApiKeyAsync(
        string apiKey,
        CancellationToken cancellationToken = default);

    // ============================================================================
    // Platform-Level Methods (using QualiFlow's Cal.com account for onboarding)
    // ============================================================================

    /// <summary>
    /// Gets available time slots for QualiFlow platform onboarding calls.
    /// Uses QualiFlow's own Cal.com API key from configuration.
    /// </summary>
    /// <param name="startDate">Start date.</param>
    /// <param name="endDate">End date.</param>
    /// <param name="timezone">Timezone.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available time slots.</returns>
    Task<IReadOnlyList<TimeSlotResponse>> GetPlatformOnboardingSlotsAsync(
        DateTime startDate,
        DateTime endDate,
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a platform-level onboarding call booking in QualiFlow's Cal.com account.
    /// </summary>
    /// <param name="startTime">Start time.</param>
    /// <param name="name">Attendee name.</param>
    /// <param name="email">Attendee email.</param>
    /// <param name="notes">Optional notes.</param>
    /// <param name="timezone">Timezone.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The Cal.com booking UID.</returns>
    Task<string> CreatePlatformOnboardingBookingAsync(
        DateTime startTime,
        string name,
        string email,
        string? notes = null,
        string timezone = "UTC",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reschedules a platform-level onboarding call booking.
    /// </summary>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="newStartTime">New start time.</param>
    /// <param name="reason">Reason for rescheduling.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task ReschedulePlatformOnboardingBookingAsync(
        string bookingUid,
        DateTime newStartTime,
        string? reason = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a platform-level onboarding call booking.
    /// </summary>
    /// <param name="bookingUid">The Cal.com booking UID.</param>
    /// <param name="reason">Cancellation reason.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A task representing the async operation.</returns>
    Task CancelPlatformOnboardingBookingAsync(
        string bookingUid,
        string? reason = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of Cal.com API key validation.
/// </summary>
public class CalComValidationResult
{
    /// <summary>Gets or sets a value indicating whether the API key is valid.</summary>
    public bool IsValid { get; set; }

    /// <summary>Gets or sets the Cal.com username.</summary>
    public string? UserName { get; set; }

    /// <summary>Gets or sets the Cal.com email.</summary>
    public string? Email { get; set; }
}
