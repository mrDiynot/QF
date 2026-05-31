// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Features.Auth.DTOs;

/// <summary>
/// DTO representing an active user session.
/// </summary>
public class ActiveSessionDto
{
    /// <summary>
    /// Gets or sets the session identifier (token family ID).
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the IP address from which the session was created.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the user agent (browser/device info).
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the device type (parsed from user agent).
    /// </summary>
    public string DeviceType { get; set; } = "Unknown";

    /// <summary>
    /// Gets or sets the browser name (parsed from user agent).
    /// </summary>
    public string Browser { get; set; } = "Unknown";

    /// <summary>
    /// Gets or sets the operating system (parsed from user agent).
    /// </summary>
    public string OperatingSystem { get; set; } = "Unknown";

    /// <summary>
    /// Gets or sets the approximate location based on IP.
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Gets or sets when the session was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the session was last active.
    /// </summary>
    public DateTime LastActivityAt { get; set; }

    /// <summary>
    /// Gets or sets when the session expires.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this is the current session.
    /// </summary>
    public bool IsCurrentSession { get; set; }
}

