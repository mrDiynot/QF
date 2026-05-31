// -----------------------------------------------------------------------
// <copyright file="NotificationPreference.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents user notification preferences for different channels and categories.
/// </summary>
public class NotificationPreference : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID these preferences belong to.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether push notifications are enabled.
    /// </summary>
    public bool PushEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether sound alerts are enabled.
    /// </summary>
    public bool SoundEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether email notifications are enabled.
    /// </summary>
    public bool EmailEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether SMS notifications are enabled.
    /// </summary>
    public bool SmsEnabled { get; set; }

    /// <summary>
    /// Gets or sets the sound volume (0-100).
    /// </summary>
    public int SoundVolume { get; set; } = 70;

    /// <summary>
    /// Gets or sets a value indicating whether quiet hours are enabled.
    /// </summary>
    public bool QuietHoursEnabled { get; set; }

    /// <summary>
    /// Gets or sets the quiet hours start time (e.g., "22:00").
    /// </summary>
    public string? QuietHoursStart { get; set; }

    /// <summary>
    /// Gets or sets the quiet hours end time (e.g., "08:00").
    /// </summary>
    public string? QuietHoursEnd { get; set; }

    /// <summary>
    /// Gets or sets the category preferences as JSON.
    /// Format: { "leads": { "push": true, "sound": true, "email": true, "sms": false }, ... }.
    /// </summary>
    public string CategoryPreferencesJson { get; set; } = "{}";

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

