// <copyright file="VoiceCall.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an AI voice call record.
/// </summary>
public class VoiceCall : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the voice agent ID.
    /// </summary>
    public Guid VoiceAgentId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID if associated.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID for unified inbox integration.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the contact name.
    /// </summary>
    public string ContactName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the phone number called.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the call direction (inbound/outbound).
    /// </summary>
    public string Direction { get; set; } = "outbound";

    /// <summary>
    /// Gets or sets the call status (completed, no_answer, busy, failed).
    /// </summary>
    public string Status { get; set; } = "completed";

    /// <summary>
    /// Gets or sets the call outcome (qualified, appointment_booked, not_interested, callback, no_answer).
    /// </summary>
    public string? Outcome { get; set; }

    /// <summary>
    /// Gets or sets the call duration in seconds.
    /// </summary>
    public int DurationSeconds { get; set; }

    /// <summary>
    /// Gets or sets the call start time.
    /// </summary>
    public DateTime StartedAt { get; set; }

    /// <summary>
    /// Gets or sets the call end time.
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the call transcript.
    /// </summary>
    public string? Transcript { get; set; }

    /// <summary>
    /// Gets or sets the call recording URL.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? RecordingUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the external call SID (Twilio).
    /// </summary>
    public string? ExternalCallSid { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this call belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the voice agent that made this call.
    /// </summary>
    public VoiceAgent VoiceAgent { get; set; } = null!;

    /// <summary>
    /// Gets or sets the associated lead.
    /// </summary>
    public Lead? Lead { get; set; }

    /// <summary>
    /// Gets or sets the associated conversation.
    /// </summary>
    public Conversation? Conversation { get; set; }
}
