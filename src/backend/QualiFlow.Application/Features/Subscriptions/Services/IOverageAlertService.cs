// <copyright file="IOverageAlertService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Subscriptions.Services;

/// <summary>
/// Service for managing overage alerts.
/// </summary>
public interface IOverageAlertService
{
    /// <summary>
    /// Gets alert settings for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Alert settings or defaults if not configured.</returns>
    Task<OverageAlertSettingsDto> GetSettingsAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates alert settings for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated settings.</returns>
    Task<OverageAlertSettingsDto> UpdateSettingsAsync(
        Guid businessId,
        UpdateOverageAlertSettingsRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks usage and sends alerts for all businesses.
    /// Called by background job.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of alerts sent.</returns>
    Task<int> CheckAndSendAlertsAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for overage alert settings.
/// </summary>
public record OverageAlertSettingsDto
{
    /// <summary>Gets a value indicating whether alerts are enabled.</summary>
    public bool IsEnabled { get; init; } = true;

    /// <summary>Gets a value indicating whether email notifications are enabled.</summary>
    public bool EmailNotificationsEnabled { get; init; } = true;

    /// <summary>Gets a value indicating whether in-app notifications are enabled.</summary>
    public bool InAppNotificationsEnabled { get; init; } = true;

    /// <summary>Gets a value indicating whether to alert at 50% usage.</summary>
    public bool AlertAt50Percent { get; init; }

    /// <summary>Gets a value indicating whether to alert at 75% usage.</summary>
    public bool AlertAt75Percent { get; init; } = true;

    /// <summary>Gets a value indicating whether to alert at 90% usage.</summary>
    public bool AlertAt90Percent { get; init; } = true;

    /// <summary>Gets a value indicating whether to alert at 100% usage.</summary>
    public bool AlertAt100Percent { get; init; } = true;

    /// <summary>Gets the email addresses to notify.</summary>
    public IReadOnlyList<string> NotifyEmails { get; init; } = [];
}

/// <summary>
/// Request to update overage alert settings.
/// </summary>
public record UpdateOverageAlertSettingsRequest
{
    /// <summary>Gets a value indicating whether alerts are enabled.</summary>
    public bool? IsEnabled { get; init; }

    /// <summary>Gets a value indicating whether email notifications are enabled.</summary>
    public bool? EmailNotificationsEnabled { get; init; }

    /// <summary>Gets a value indicating whether in-app notifications are enabled.</summary>
    public bool? InAppNotificationsEnabled { get; init; }

    /// <summary>Gets a value indicating whether to alert at 50% usage.</summary>
    public bool? AlertAt50Percent { get; init; }

    /// <summary>Gets a value indicating whether to alert at 75% usage.</summary>
    public bool? AlertAt75Percent { get; init; }

    /// <summary>Gets a value indicating whether to alert at 90% usage.</summary>
    public bool? AlertAt90Percent { get; init; }

    /// <summary>Gets a value indicating whether to alert at 100% usage.</summary>
    public bool? AlertAt100Percent { get; init; }

    /// <summary>Gets the email addresses to notify.</summary>
    public IReadOnlyList<string>? NotifyEmails { get; init; }
}
