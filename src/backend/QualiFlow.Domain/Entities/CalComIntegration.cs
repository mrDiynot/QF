// <copyright file="CalComIntegration.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a Cal.com integration for a business.
/// Each business can connect their own Cal.com account for booking and scheduling.
/// </summary>
public class CalComIntegration : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who connected this integration.
    /// </summary>
    public Guid ConnectedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the Cal.com API key (encrypted).
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Cal.com username.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the Cal.com user email.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the default event type ID for AI-scheduled bookings.
    /// </summary>
    public string? DefaultEventTypeId { get; set; }

    /// <summary>
    /// Gets or sets the integration status.
    /// </summary>
    public CalComIntegrationStatus Status { get; set; } = CalComIntegrationStatus.Active;

    /// <summary>
    /// Gets or sets the last successful sync timestamp.
    /// </summary>
    public DateTime? LastSyncAt { get; set; }

    /// <summary>
    /// Gets or sets the last error message if any.
    /// </summary>
    public string? LastErrorMessage { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who connected this integration.
    /// </summary>
    public ApplicationUser? ConnectedByUser { get; set; }
}
