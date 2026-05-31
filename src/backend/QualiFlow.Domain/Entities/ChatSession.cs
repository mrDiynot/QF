// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an active or completed chat session with a visitor.
/// </summary>
public class ChatSession : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (for multi-tenancy).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the chat widget ID.
    /// </summary>
    public Guid ChatWidgetId { get; set; }

    /// <summary>
    /// Gets or sets the unique session token for the visitor.
    /// </summary>
    public string SessionToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the visitor's name (from pre-chat form or AI extraction).
    /// </summary>
    public string? VisitorName { get; set; }

    /// <summary>
    /// Gets or sets the visitor's email.
    /// </summary>
    public string? VisitorEmail { get; set; }

    /// <summary>
    /// Gets or sets the visitor's phone number.
    /// </summary>
    public string? VisitorPhone { get; set; }

    /// <summary>
    /// Gets or sets the session status.
    /// </summary>
    public ChatSessionStatus Status { get; set; } = ChatSessionStatus.Active;

    /// <summary>
    /// Gets or sets the visitor's IP address.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Gets or sets the visitor's user agent.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Gets or sets the page URL where chat was initiated.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the referrer URL.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? ReferrerUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets the assigned agent ID (if transferred to human).
    /// </summary>
    public string? AssignedAgentId { get; set; }

    /// <summary>
    /// Gets or sets when the session started.
    /// </summary>
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets when the session ended.
    /// </summary>
    public DateTime? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the last activity timestamp.
    /// </summary>
    public DateTime LastActivityAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the lead ID if a lead was created from this session.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID if linked to a conversation.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the AI qualification score (0-100).
    /// </summary>
    public int? AIQualificationScore { get; set; }

    /// <summary>
    /// Gets or sets extracted visitor data as JSON.
    /// </summary>
    public string? ExtractedDataJson { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the chat widget.
    /// </summary>
    public ChatWidget ChatWidget { get; set; } = null!;

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the linked lead.
    /// </summary>
    public Lead? Lead { get; set; }

    /// <summary>
    /// Gets or sets the linked conversation.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets the messages in this session.
    /// </summary>
    public ICollection<ChatMessage> Messages { get; } = [];
}

