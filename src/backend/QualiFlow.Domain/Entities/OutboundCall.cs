// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an outbound AI-initiated phone call.
/// </summary>
public class OutboundCall : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID this call is for.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID created for this call.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the call script ID used for this call.
    /// </summary>
    public Guid? CallScriptId { get; set; }

    /// <summary>
    /// Gets or sets the Twilio Call SID.
    /// </summary>
    public string TwilioCallSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the from phone number (business number).
    /// </summary>
    public string FromPhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the to phone number (lead's number).
    /// </summary>
    public string ToPhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the call status.
    /// </summary>
    public OutboundCallStatus Status { get; set; } = OutboundCallStatus.Pending;

    /// <summary>
    /// Gets or sets the call outcome.
    /// </summary>
    public OutboundCallOutcome? Outcome { get; set; }

    /// <summary>
    /// Gets or sets when the call is scheduled to be made.
    /// </summary>
    public DateTime? ScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets when the call was initiated.
    /// </summary>
    public DateTime? InitiatedAt { get; set; }

    /// <summary>
    /// Gets or sets when the call was connected.
    /// </summary>
    public DateTime? ConnectedAt { get; set; }

    /// <summary>
    /// Gets or sets when the call ended.
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the call duration in seconds.
    /// </summary>
    public int? DurationSeconds { get; set; }

    /// <summary>
    /// Gets or sets the recording URL as a string (Twilio returns URL as string).
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "Twilio API returns URL as string")]
    public string? RecordingUrl { get; set; }

    /// <summary>
    /// Gets or sets the Twilio Recording SID.
    /// </summary>
    public string? RecordingSid { get; set; }

    /// <summary>
    /// Gets or sets the transcription of the call.
    /// </summary>
    public string? Transcription { get; set; }

    /// <summary>
    /// Gets or sets the current retry attempt number.
    /// </summary>
    public int RetryAttempt { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of retry attempts.
    /// </summary>
    public int MaxRetries { get; set; } = 3;

    /// <summary>
    /// Gets or sets any error message if the call failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this call belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead this call is for.
    /// </summary>
    public Lead Lead { get; set; } = null!;

    /// <summary>
    /// Gets or sets the conversation created for this call.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the call script used for this call.
    /// </summary>
    public CallScript? CallScript { get; set; }
}

