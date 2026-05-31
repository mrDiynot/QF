// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an analytics event from the chat widget.
/// Used to track user interactions for funnel analysis and behavior insights.
/// </summary>
public class ChatWidgetEvent : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (for multi-tenancy).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the chat session ID (if applicable).
    /// </summary>
    public Guid? ChatSessionId { get; set; }

    /// <summary>
    /// Gets or sets the event type.
    /// Examples: "widget_opened", "widget_closed", "quick_reply_clicked",
    /// "email_captured", "waitlist_joined", "message_sent", "ai_response_received".
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets additional event data as JSON.
    /// Can store context-specific information like quick reply label, etc.
    /// </summary>
    public string? EventData { get; set; }

    /// <summary>
    /// Gets or sets the visitor's session token (for anonymous tracking).
    /// </summary>
    public string? VisitorToken { get; set; }

    /// <summary>
    /// Gets or sets the page URL where the event occurred.
    /// </summary>
#pragma warning disable CA1056 // URI-like properties should not be strings
    public string? PageUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets when the event occurred.
    /// </summary>
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the linked chat session (if any).
    /// </summary>
    public ChatSession? ChatSession { get; set; }
}
