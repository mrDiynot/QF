// -----------------------------------------------------------------------
// <copyright file="NotificationPreferenceService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Notifications.DTOs;
using QualiFlow.Application.Features.Notifications.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service for managing user notification preferences.
/// </summary>
public partial class NotificationPreferenceService : INotificationPreferenceService
{
    private readonly QualiFlowDbContext _context;
    private readonly ILogger<NotificationPreferenceService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NotificationPreferenceService"/> class.
    /// </summary>
    public NotificationPreferenceService(
        QualiFlowDbContext context,
        ILogger<NotificationPreferenceService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<NotificationPreferenceDto> GetPreferencesAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var preference = await _context.NotificationPreferences
            .FirstOrDefaultAsync(
                np => np.BusinessId == businessId && np.UserId == userId,
                cancellationToken);

        if (preference == null)
        {
            // Return default preferences
            return GetDefaultPreferences();
        }

        return MapToDto(preference);
    }

    /// <inheritdoc/>
    public async Task<NotificationPreferenceDto> UpdatePreferencesAsync(
        Guid businessId,
        Guid userId,
        UpdateNotificationPreferencesRequest request,
        CancellationToken cancellationToken = default)
    {
        var preference = await _context.NotificationPreferences
            .FirstOrDefaultAsync(
                np => np.BusinessId == businessId && np.UserId == userId,
                cancellationToken);

        if (preference == null)
        {
            preference = new NotificationPreference
            {
                BusinessId = businessId,
                UserId = userId,
            };
            _context.NotificationPreferences.Add(preference);
        }

        // Update properties
        if (request.PushEnabled.HasValue)
        {
            preference.PushEnabled = request.PushEnabled.Value;
        }

        if (request.SoundEnabled.HasValue)
        {
            preference.SoundEnabled = request.SoundEnabled.Value;
        }

        if (request.EmailEnabled.HasValue)
        {
            preference.EmailEnabled = request.EmailEnabled.Value;
        }

        if (request.SmsEnabled.HasValue)
        {
            preference.SmsEnabled = request.SmsEnabled.Value;
        }

        if (request.SoundVolume.HasValue)
        {
            preference.SoundVolume = Math.Clamp(request.SoundVolume.Value, 0, 100);
        }

        if (request.QuietHoursEnabled.HasValue)
        {
            preference.QuietHoursEnabled = request.QuietHoursEnabled.Value;
        }

        if (request.QuietHoursStart != null)
        {
            preference.QuietHoursStart = request.QuietHoursStart;
        }

        if (request.QuietHoursEnd != null)
        {
            preference.QuietHoursEnd = request.QuietHoursEnd;
        }

        if (request.Categories != null)
        {
            var existingCategories = DeserializeCategories(preference.CategoryPreferencesJson);
            foreach (var (key, value) in request.Categories)
            {
                existingCategories[key] = value;
            }

            preference.CategoryPreferencesJson = JsonSerializer.Serialize(existingCategories);
        }

        preference.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        LogPreferencesUpdated(_logger, userId, businessId);

        return MapToDto(preference);
    }

    /// <inheritdoc/>
    public async Task<bool> IsChannelEnabledAsync(
        Guid businessId,
        Guid userId,
        string category,
        string channel,
        CancellationToken cancellationToken = default)
    {
        var prefs = await GetPreferencesAsync(businessId, userId, cancellationToken);

        // Check global channel setting first
        var globalEnabled = channel.ToLowerInvariant() switch
        {
            "push" => prefs.PushEnabled,
            "sound" => prefs.SoundEnabled,
            "email" => prefs.EmailEnabled,
            "sms" => prefs.SmsEnabled,
            _ => true,
        };

        if (!globalEnabled)
        {
            return false;
        }

        // Check category-specific setting
        if (prefs.Categories.TryGetValue(category.ToLowerInvariant(), out var categoryPrefs))
        {
            return channel.ToLowerInvariant() switch
            {
                "push" => categoryPrefs.Push,
                "sound" => categoryPrefs.Sound,
                "email" => categoryPrefs.Email,
                "sms" => categoryPrefs.Sms,
                _ => true,
            };
        }

        return true; // Default to enabled if no category preference
    }

    /// <inheritdoc/>
    public async Task<bool> IsInQuietHoursAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var prefs = await GetPreferencesAsync(businessId, userId, cancellationToken);

        if (!prefs.QuietHoursEnabled || string.IsNullOrEmpty(prefs.QuietHoursStart) || string.IsNullOrEmpty(prefs.QuietHoursEnd))
        {
            return false;
        }

        if (!TimeOnly.TryParse(prefs.QuietHoursStart, CultureInfo.InvariantCulture, out var start) ||
            !TimeOnly.TryParse(prefs.QuietHoursEnd, CultureInfo.InvariantCulture, out var end))
        {
            return false;
        }

        var now = TimeOnly.FromDateTime(DateTime.UtcNow);

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (start > end)
        {
            return now >= start || now <= end;
        }

        return now >= start && now <= end;
    }

    private static NotificationPreferenceDto GetDefaultPreferences()
    {
        return new NotificationPreferenceDto
        {
            PushEnabled = true,
            SoundEnabled = true,
            EmailEnabled = true,
            SmsEnabled = false,
            SoundVolume = 70,
            QuietHoursEnabled = false,
            Categories = GetDefaultCategories(),
        };
    }

    private static Dictionary<string, CategoryChannelPreferences> GetDefaultCategories()
    {
        var defaultPrefs = new CategoryChannelPreferences
        {
            Push = true,
            Sound = true,
            Email = true,
            Sms = false,
        };

        return new Dictionary<string, CategoryChannelPreferences>
        {
            ["leads"] = defaultPrefs,
            ["conversations"] = defaultPrefs,
            ["bookings"] = defaultPrefs,
            ["payments"] = defaultPrefs,
            ["system"] = defaultPrefs with { Sms = false, Email = true },
        };
    }

    private static NotificationPreferenceDto MapToDto(NotificationPreference preference)
    {
        return new NotificationPreferenceDto
        {
            PushEnabled = preference.PushEnabled,
            SoundEnabled = preference.SoundEnabled,
            EmailEnabled = preference.EmailEnabled,
            SmsEnabled = preference.SmsEnabled,
            SoundVolume = preference.SoundVolume,
            QuietHoursEnabled = preference.QuietHoursEnabled,
            QuietHoursStart = preference.QuietHoursStart,
            QuietHoursEnd = preference.QuietHoursEnd,
            Categories = DeserializeCategories(preference.CategoryPreferencesJson),
        };
    }

    private static Dictionary<string, CategoryChannelPreferences> DeserializeCategories(string json)
    {
        try
        {
            if (string.IsNullOrEmpty(json) || json == "{}")
            {
                return GetDefaultCategories();
            }

            return JsonSerializer.Deserialize<Dictionary<string, CategoryChannelPreferences>>(json)
                ?? GetDefaultCategories();
        }
        catch
        {
            return GetDefaultCategories();
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Notification preferences updated for user {UserId} in business {BusinessId}")]
    private static partial void LogPreferencesUpdated(ILogger logger, Guid userId, Guid businessId);
}

