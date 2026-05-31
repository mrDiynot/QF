// -----------------------------------------------------------------------
// <copyright file="INotificationPreferenceService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.Notifications.DTOs;

namespace QualiFlow.Application.Features.Notifications.Services;

/// <summary>
/// Service interface for managing user notification preferences.
/// </summary>
public interface INotificationPreferenceService
{
    /// <summary>
    /// Gets the notification preferences for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user's notification preferences.</returns>
    Task<NotificationPreferenceDto> GetPreferencesAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the notification preferences for a user.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="request">The preferences to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated notification preferences.</returns>
    Task<NotificationPreferenceDto> UpdatePreferencesAsync(
        Guid businessId,
        Guid userId,
        UpdateNotificationPreferencesRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a notification channel is enabled for a user and category.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="category">The notification category.</param>
    /// <param name="channel">The notification channel.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the channel is enabled for the category.</returns>
    Task<bool> IsChannelEnabledAsync(
        Guid businessId,
        Guid userId,
        string category,
        string channel,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if the user is currently in quiet hours.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="userId">The user ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the user is in quiet hours.</returns>
    Task<bool> IsInQuietHoursAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default);
}

