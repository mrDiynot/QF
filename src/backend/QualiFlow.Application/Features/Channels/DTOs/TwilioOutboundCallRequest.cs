// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Diagnostics.CodeAnalysis;

namespace QualiFlow.Application.Features.Channels.DTOs;

/// <summary>
/// Request to initiate an outbound call via Twilio.
/// </summary>
public record TwilioOutboundCallRequest
{
    /// <summary>
    /// Gets the phone number to call (E.164 format).
    /// </summary>
    public required string ToPhoneNumber { get; init; }

    /// <summary>
    /// Gets the phone number to call from (E.164 format).
    /// </summary>
    public required string FromPhoneNumber { get; init; }

    /// <summary>
    /// Gets the TwiML URL for call handling.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API uses string URLs")]
    public required string TwimlUrl { get; init; }

    /// <summary>
    /// Gets the status callback URL.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API uses string URLs")]
    public string? StatusCallbackUrl { get; init; }

    /// <summary>
    /// Gets the Twilio sub-account SID (optional).
    /// </summary>
    public string? SubAccountSid { get; init; }

    /// <summary>
    /// Gets a value indicating whether to record the call.
    /// </summary>
    public bool Record { get; init; }

    /// <summary>
    /// Gets the timeout in seconds before the call is considered unanswered.
    /// </summary>
    public int TimeoutSeconds { get; init; } = 30;

    /// <summary>
    /// Gets the machine detection setting.
    /// </summary>
    public string? MachineDetection { get; init; }
}

/// <summary>
/// Result of initiating an outbound call.
/// </summary>
public record TwilioOutboundCallResultDto
{
    /// <summary>
    /// Gets the Twilio Call SID.
    /// </summary>
    public required string CallSid { get; init; }

    /// <summary>
    /// Gets the call status.
    /// </summary>
    public required string Status { get; init; }

    /// <summary>
    /// Gets the phone number called.
    /// </summary>
    public required string ToPhoneNumber { get; init; }

    /// <summary>
    /// Gets the phone number called from.
    /// </summary>
    public required string FromPhoneNumber { get; init; }

    /// <summary>
    /// Gets the call direction.
    /// </summary>
    public string Direction { get; init; } = "outbound-api";

    /// <summary>
    /// Gets the timestamp when the call was initiated.
    /// </summary>
    public DateTime InitiatedAt { get; init; } = DateTime.UtcNow;
}

/// <summary>
/// Status of a Twilio call.
/// </summary>
public record TwilioCallStatusDto
{
    /// <summary>
    /// Gets the Twilio Call SID.
    /// </summary>
    public required string CallSid { get; init; }

    /// <summary>
    /// Gets the call status (queued, ringing, in-progress, completed, busy, failed, no-answer, canceled).
    /// </summary>
    public required string Status { get; init; }

    /// <summary>
    /// Gets the call duration in seconds.
    /// </summary>
    public int? DurationSeconds { get; init; }

    /// <summary>
    /// Gets the answered by value (human, machine, unknown).
    /// </summary>
    public string? AnsweredBy { get; init; }

    /// <summary>
    /// Gets the timestamp when the call started.
    /// </summary>
    public DateTime? StartTime { get; init; }

    /// <summary>
    /// Gets the timestamp when the call ended.
    /// </summary>
    public DateTime? EndTime { get; init; }
}

/// <summary>
/// Recording details for a Twilio call.
/// </summary>
public record TwilioRecordingDto
{
    /// <summary>
    /// Gets the recording SID.
    /// </summary>
    public required string RecordingSid { get; init; }

    /// <summary>
    /// Gets the recording URL.
    /// </summary>
    [SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API uses string URLs")]
    public required string RecordingUrl { get; init; }

    /// <summary>
    /// Gets the recording duration in seconds.
    /// </summary>
    public int DurationSeconds { get; init; }

    /// <summary>
    /// Gets the recording status.
    /// </summary>
    public required string Status { get; init; }
}

