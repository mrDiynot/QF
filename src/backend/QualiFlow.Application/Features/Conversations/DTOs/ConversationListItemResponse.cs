// -----------------------------------------------------------------------
// <copyright file="ConversationListItemResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Enhanced conversation list item with last message and unread count.
/// </summary>
public sealed record ConversationListItemResponse
{
    /// <summary>Gets the conversation ID.</summary>
    public Guid Id { get; init; }

    /// <summary>Gets the lead ID.</summary>
    public Guid LeadId { get; init; }

    /// <summary>Gets the lead summary.</summary>
    public LeadSummaryDto? Lead { get; init; }

    /// <summary>Gets the channel type.</summary>
    public string Channel { get; init; } = string.Empty;

    /// <summary>Gets the conversation status.</summary>
    public ConversationStatus Status { get; init; }

    /// <summary>Gets the last message preview.</summary>
    public LastMessagePreviewDto? LastMessage { get; init; }

    /// <summary>Gets the unread message count for the current user.</summary>
    public int UnreadCount { get; init; }

    /// <summary>Gets when the conversation was created.</summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>Gets when the last message was sent.</summary>
    public DateTime? LastMessageAt { get; init; }
}

