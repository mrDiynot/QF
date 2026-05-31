// <copyright file="OverageAlertSettings.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents overage alert settings for a business.
/// Configures when to send alerts based on usage thresholds.
/// </summary>
public class OverageAlertSettings : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether overage alerts are enabled.
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to send email notifications.
    /// </summary>
    public bool EmailNotificationsEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to send in-app notifications.
    /// </summary>
    public bool InAppNotificationsEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to alert at 50% usage.
    /// </summary>
    public bool AlertAt50Percent { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether to alert at 75% usage.
    /// </summary>
    public bool AlertAt75Percent { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to alert at 90% usage.
    /// </summary>
    public bool AlertAt90Percent { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether to alert at 100% usage.
    /// </summary>
    public bool AlertAt100Percent { get; set; } = true;

    /// <summary>
    /// Gets or sets the last alert sent timestamp for 50% threshold.
    /// Used to prevent duplicate alerts.
    /// </summary>
    public DateTime? LastAlertAt50Percent { get; set; }

    /// <summary>
    /// Gets or sets the last alert sent timestamp for 75% threshold.
    /// </summary>
    public DateTime? LastAlertAt75Percent { get; set; }

    /// <summary>
    /// Gets or sets the last alert sent timestamp for 90% threshold.
    /// </summary>
    public DateTime? LastAlertAt90Percent { get; set; }

    /// <summary>
    /// Gets or sets the last alert sent timestamp for 100% threshold.
    /// </summary>
    public DateTime? LastAlertAt100Percent { get; set; }

    /// <summary>
    /// Gets or sets the email addresses to notify (JSON array).
    /// If empty, uses business owner email.
    /// </summary>
    public string NotifyEmailsJson { get; set; } = "[]";

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this settings belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
