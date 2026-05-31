// <copyright file="CalendarIntegration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a calendar integration for a business (Google Calendar, Outlook, etc.).
/// </summary>
public class CalendarIntegration : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who owns this integration.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the provider type (Google, Microsoft, etc.).
    /// </summary>
    public string Provider { get; set; } = "Google";

    /// <summary>
    /// Gets or sets the external account email.
    /// </summary>
    public string ExternalEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the access token (encrypted).
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the refresh token (encrypted).
    /// </summary>
    public string? RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets when the access token expires.
    /// </summary>
    public DateTime? TokenExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the selected calendar ID for syncing.
    /// </summary>
    public string? SelectedCalendarId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether sync is enabled.
    /// </summary>
    public bool IsSyncEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to sync bookings to calendar.
    /// </summary>
    public bool SyncBookingsToCalendar { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to block busy times from calendar.
    /// </summary>
    public bool BlockBusyTimes { get; set; } = true;

    /// <summary>
    /// Gets or sets the last sync timestamp.
    /// </summary>
    public DateTime? LastSyncAt { get; set; }

    /// <summary>
    /// Gets or sets any sync error message.
    /// </summary>
    public string? LastSyncError { get; set; }

    /// <summary>
    /// Gets or sets the sync status.
    /// </summary>
    public string Status { get; set; } = "Active";

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user.
    /// </summary>
    public ApplicationUser User { get; set; } = null!;
}
