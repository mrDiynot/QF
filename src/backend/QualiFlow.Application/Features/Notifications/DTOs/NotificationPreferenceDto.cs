// -----------------------------------------------------------------------
// <copyright file="NotificationPreferenceDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Notifications.DTOs;

/// <summary>
/// DTO for notification preferences.
/// </summary>
public record NotificationPreferenceDto
{
    /// <summary>
    /// Gets a value indicating whether push notifications are enabled.
    /// </summary>
    public bool PushEnabled { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether sound alerts are enabled.
    /// </summary>
    public bool SoundEnabled { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether email notifications are enabled.
    /// </summary>
    public bool EmailEnabled { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether SMS notifications are enabled.
    /// </summary>
    public bool SmsEnabled { get; init; }

    /// <summary>
    /// Gets the sound volume (0-100).
    /// </summary>
    public int SoundVolume { get; init; } = 70;

    /// <summary>
    /// Gets a value indicating whether quiet hours are enabled.
    /// </summary>
    public bool QuietHoursEnabled { get; init; }

    /// <summary>
    /// Gets the quiet hours start time (e.g., "22:00").
    /// </summary>
    public string? QuietHoursStart { get; init; }

    /// <summary>
    /// Gets the quiet hours end time (e.g., "08:00").
    /// </summary>
    public string? QuietHoursEnd { get; init; }

    /// <summary>
    /// Gets the category preferences.
    /// </summary>
    public IDictionary<string, CategoryChannelPreferences> Categories { get; init; } = new Dictionary<string, CategoryChannelPreferences>();
}

/// <summary>
/// Channel preferences for a specific notification category.
/// </summary>
public record CategoryChannelPreferences
{
    /// <summary>
    /// Gets a value indicating whether push is enabled for this category.
    /// </summary>
    public bool Push { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether sound is enabled for this category.
    /// </summary>
    public bool Sound { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether email is enabled for this category.
    /// </summary>
    public bool Email { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether SMS is enabled for this category.
    /// </summary>
    public bool Sms { get; init; }
}

/// <summary>
/// Request DTO for updating notification preferences.
/// </summary>
public record UpdateNotificationPreferencesRequest
{
    /// <summary>
    /// Gets a value indicating whether push notifications are enabled.
    /// </summary>
    public bool? PushEnabled { get; init; }

    /// <summary>
    /// Gets a value indicating whether sound alerts are enabled.
    /// </summary>
    public bool? SoundEnabled { get; init; }

    /// <summary>
    /// Gets a value indicating whether email notifications are enabled.
    /// </summary>
    public bool? EmailEnabled { get; init; }

    /// <summary>
    /// Gets a value indicating whether SMS notifications are enabled.
    /// </summary>
    public bool? SmsEnabled { get; init; }

    /// <summary>
    /// Gets the sound volume (0-100).
    /// </summary>
    public int? SoundVolume { get; init; }

    /// <summary>
    /// Gets a value indicating whether quiet hours are enabled.
    /// </summary>
    public bool? QuietHoursEnabled { get; init; }

    /// <summary>
    /// Gets the quiet hours start time.
    /// </summary>
    public string? QuietHoursStart { get; init; }

    /// <summary>
    /// Gets the quiet hours end time.
    /// </summary>
    public string? QuietHoursEnd { get; init; }

    /// <summary>
    /// Gets the category preferences to update.
    /// </summary>
    public IDictionary<string, CategoryChannelPreferences>? Categories { get; init; }
}

