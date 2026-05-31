// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.OutboundCalls.DTOs;

/// <summary>
/// DTO representing an outbound call.
/// </summary>
public record OutboundCallDto
{
    /// <summary>
    /// Gets the call ID.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the business ID.
    /// </summary>
    public Guid BusinessId { get; init; }

    /// <summary>
    /// Gets the lead ID.
    /// </summary>
    public Guid LeadId { get; init; }

    /// <summary>
    /// Gets the lead name.
    /// </summary>
    public string? LeadName { get; init; }

    /// <summary>
    /// Gets the conversation ID.
    /// </summary>
    public Guid? ConversationId { get; init; }

    /// <summary>
    /// Gets the call script ID.
    /// </summary>
    public Guid? CallScriptId { get; init; }

    /// <summary>
    /// Gets the call script name.
    /// </summary>
    public string? CallScriptName { get; init; }

    /// <summary>
    /// Gets the Twilio Call SID.
    /// </summary>
    public string TwilioCallSid { get; init; } = string.Empty;

    /// <summary>
    /// Gets the from phone number.
    /// </summary>
    public string FromPhoneNumber { get; init; } = string.Empty;

    /// <summary>
    /// Gets the to phone number.
    /// </summary>
    public string ToPhoneNumber { get; init; } = string.Empty;

    /// <summary>
    /// Gets the call status.
    /// </summary>
    public OutboundCallStatus Status { get; init; }

    /// <summary>
    /// Gets the call outcome.
    /// </summary>
    public OutboundCallOutcome? Outcome { get; init; }

    /// <summary>
    /// Gets when the call is scheduled.
    /// </summary>
    public DateTime? ScheduledAt { get; init; }

    /// <summary>
    /// Gets when the call was initiated.
    /// </summary>
    public DateTime? InitiatedAt { get; init; }

    /// <summary>
    /// Gets when the call was connected.
    /// </summary>
    public DateTime? ConnectedAt { get; init; }

    /// <summary>
    /// Gets when the call ended.
    /// </summary>
    public DateTime? EndedAt { get; init; }

    /// <summary>
    /// Gets the call duration in seconds.
    /// </summary>
    public int? DurationSeconds { get; init; }

    /// <summary>
    /// Gets the recording URL as a string.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API returns URL as string")]
    public string? RecordingUrl { get; init; }

    /// <summary>
    /// Gets the transcription.
    /// </summary>
    public string? Transcription { get; init; }

    /// <summary>
    /// Gets the retry attempt number.
    /// </summary>
    public int RetryAttempt { get; init; }

    /// <summary>
    /// Gets the maximum retries.
    /// </summary>
    public int MaxRetries { get; init; }

    /// <summary>
    /// Gets any error message.
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// Gets when the call was created.
    /// </summary>
    public DateTime CreatedAt { get; init; }
}

