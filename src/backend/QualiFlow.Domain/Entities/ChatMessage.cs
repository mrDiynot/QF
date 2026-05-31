// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a message within a chat session.
/// </summary>
public class ChatMessage : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (for multi-tenancy).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the chat session ID.
    /// </summary>
    public Guid ChatSessionId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the message type.
    /// </summary>
    public ChatMessageType Type { get; set; } = ChatMessageType.Visitor;

    /// <summary>
    /// Gets or sets the sender ID (visitor session token, agent user ID, or "AI").
    /// </summary>
    public string SenderId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the sender name for display.
    /// </summary>
    public string? SenderName { get; set; }

    /// <summary>
    /// Gets or sets when the message was sent.
    /// </summary>
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the message was read by the other party.
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Gets or sets when the message was read.
    /// </summary>
    public DateTime? ReadAt { get; set; }

    /// <summary>
    /// Gets or sets attachment URLs as JSON array.
    /// </summary>
    public string? AttachmentsJson { get; set; }

    /// <summary>
    /// Gets or sets AI intent detected in the message.
    /// </summary>
    public string? DetectedIntent { get; set; }

    /// <summary>
    /// Gets or sets sentiment score (-1 to 1).
    /// </summary>
    public float? SentimentScore { get; set; }

    /// <summary>
    /// Gets or sets metadata as JSON.
    /// </summary>
    public string? MetadataJson { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the chat session.
    /// </summary>
    public ChatSession ChatSession { get; set; } = null!;

    /// <summary>
    /// Gets or sets the business.
    /// </summary>
    public Business Business { get; set; } = null!;
}

