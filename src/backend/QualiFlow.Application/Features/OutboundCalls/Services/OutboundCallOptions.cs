// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.OutboundCalls.Services;

/// <summary>
/// Configuration options for outbound calling.
/// </summary>
public class OutboundCallOptions
{
    /// <summary>
    /// Configuration section name.
    /// </summary>
    public const string SectionName = "OutboundCalls";

    /// <summary>
    /// Gets or sets the default from phone number (E.164 format).
    /// </summary>
    public string DefaultFromPhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the base URL for TwiML endpoints.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Configuration value")]
    public string TwimlBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the base URL for webhook endpoints.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Configuration value")]
    public string WebhookBaseUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the maximum call duration in seconds.
    /// </summary>
    public int MaxCallDurationSeconds { get; set; } = 600;

    /// <summary>
    /// Gets or sets the timeout before considering a call unanswered.
    /// </summary>
    public int RingTimeoutSeconds { get; set; } = 30;
}

