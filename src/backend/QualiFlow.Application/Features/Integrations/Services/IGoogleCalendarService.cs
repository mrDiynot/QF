// <copyright file="IGoogleCalendarService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Integrations.Services;

/// <summary>
/// Service for Google Calendar integration.
/// </summary>
public interface IGoogleCalendarService
{
    /// <summary>
    /// Initiates the OAuth flow for Google Calendar.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="redirectUri">The redirect URI after authorization.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The authorization URL to redirect the user to.</returns>
#pragma warning disable CA1054 // URI parameters should not be strings - OAuth redirectUri comes from frontend as string
    Task<string> InitiateOAuthAsync(
        Guid businessId,
        Guid userId,
        string redirectUri,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054

    /// <summary>
    /// Handles the OAuth callback and stores tokens.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="code">The authorization code.</param>
    /// <param name="redirectUri">The redirect URI used in the initial request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The integration details.</returns>
#pragma warning disable CA1054
    Task<CalendarIntegrationDto> HandleCallbackAsync(
        Guid businessId,
        Guid userId,
        string code,
        string redirectUri,
        CancellationToken cancellationToken = default);
#pragma warning restore CA1054

    /// <summary>
    /// Gets the current calendar integration for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The integration details or null.</returns>
    Task<CalendarIntegrationDto?> GetIntegrationAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Disconnects the Google Calendar integration.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if disconnected successfully.</returns>
    Task<bool> DisconnectAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available calendars for the connected account.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of calendars.</returns>
    Task<IReadOnlyList<CalendarDto>> GetCalendarsAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the calendar sync settings.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated integration.</returns>
    Task<CalendarIntegrationDto> UpdateSettingsAsync(
        Guid businessId,
        Guid userId,
        UpdateCalendarSettingsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets busy times from the calendar.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="startTime">Start of the time range.</param>
    /// <param name="endTime">End of the time range.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of busy time slots.</returns>
    Task<IReadOnlyList<BusyTimeSlot>> GetBusyTimesAsync(
        Guid businessId,
        Guid userId,
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates an event on the calendar.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The event creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created event ID.</returns>
    Task<string> CreateEventAsync(
        Guid businessId,
        Guid userId,
        CreateCalendarEventRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for calendar integration.
/// </summary>
public record CalendarIntegrationDto
{
    /// <summary>Gets the integration ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the provider (Google, Microsoft).</summary>
    public string Provider { get; init; } = string.Empty;

    /// <summary>Gets the connected email.</summary>
    public string ExternalEmail { get; init; } = string.Empty;

    /// <summary>Gets the selected calendar ID.</summary>
    public string? SelectedCalendarId { get; init; }

    /// <summary>Gets a value indicating whether sync is enabled.</summary>
    public bool IsSyncEnabled { get; init; }

    /// <summary>Gets a value indicating whether to sync bookings to calendar.</summary>
    public bool SyncBookingsToCalendar { get; init; }

    /// <summary>Gets a value indicating whether to block busy times.</summary>
    public bool BlockBusyTimes { get; init; }

    /// <summary>Gets the last sync timestamp.</summary>
    public DateTime? LastSyncAt { get; init; }

    /// <summary>Gets the status.</summary>
    public string Status { get; init; } = string.Empty;
}

/// <summary>
/// DTO for a calendar.
/// </summary>
public record CalendarDto
{
    /// <summary>Gets the calendar ID.</summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>Gets the calendar name.</summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>Gets a value indicating whether this is the primary calendar.</summary>
    public bool IsPrimary { get; init; }

    /// <summary>Gets the access role.</summary>
    public string AccessRole { get; init; } = string.Empty;
}

/// <summary>
/// Request to update calendar settings.
/// </summary>
public record UpdateCalendarSettingsRequest
{
    /// <summary>Gets the selected calendar ID.</summary>
    public string? SelectedCalendarId { get; init; }

    /// <summary>Gets a value indicating whether sync is enabled.</summary>
    public bool? IsSyncEnabled { get; init; }

    /// <summary>Gets a value indicating whether to sync bookings to calendar.</summary>
    public bool? SyncBookingsToCalendar { get; init; }

    /// <summary>Gets a value indicating whether to block busy times.</summary>
    public bool? BlockBusyTimes { get; init; }
}

/// <summary>
/// Represents a busy time slot.
/// </summary>
public record BusyTimeSlot
{
    /// <summary>Gets the start time.</summary>
    public DateTime Start { get; init; }

    /// <summary>Gets the end time.</summary>
    public DateTime End { get; init; }
}

/// <summary>
/// Request to create a calendar event.
/// </summary>
public record CreateCalendarEventRequest
{
    /// <summary>Gets the event summary/title.</summary>
    public string Summary { get; init; } = string.Empty;

    /// <summary>Gets the event description.</summary>
    public string? Description { get; init; }

    /// <summary>Gets the start time.</summary>
    public DateTime StartTime { get; init; }

    /// <summary>Gets the end time.</summary>
    public DateTime EndTime { get; init; }

    /// <summary>Gets the attendee emails.</summary>
    public IReadOnlyList<string>? Attendees { get; init; }

    /// <summary>Gets the location.</summary>
    public string? Location { get; init; }
}
