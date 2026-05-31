// -----------------------------------------------------------------------
// <copyright file="ConversationMessageDto.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// DTO for a conversation message used in AI analysis.
/// </summary>
public sealed record ConversationMessageDto
{
    /// <summary>Gets the message content.</summary>
    public required string Content { get; init; }

    /// <summary>Gets the sender role (lead, agent, system).</summary>
    public required string Role { get; init; }

    /// <summary>Gets when the message was sent.</summary>
    public required DateTime SentAt { get; init; }
}

