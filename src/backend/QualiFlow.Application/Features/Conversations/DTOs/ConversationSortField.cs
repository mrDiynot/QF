// -----------------------------------------------------------------------
// <copyright file="ConversationSortField.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Sort fields for conversation list.
/// </summary>
public enum ConversationSortField
{
    /// <summary>Sort by last message timestamp.</summary>
    LastMessageAt,

    /// <summary>Sort by creation date.</summary>
    CreatedAt,

    /// <summary>Sort by unread count.</summary>
    UnreadCount,
}

