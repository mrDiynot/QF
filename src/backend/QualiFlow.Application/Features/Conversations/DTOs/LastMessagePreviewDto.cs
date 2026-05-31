// -----------------------------------------------------------------------
// <copyright file="LastMessagePreviewDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Last message preview for conversation list.
/// </summary>
public sealed record LastMessagePreviewDto
{
    /// <summary>Gets the message content (truncated to 100 chars).</summary>
    public string Content { get; init; } = string.Empty;

    /// <summary>Gets the message direction.</summary>
    public string Direction { get; init; } = string.Empty;

    /// <summary>Gets when the message was sent.</summary>
    public DateTime SentAt { get; init; }
}

