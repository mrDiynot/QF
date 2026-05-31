// -----------------------------------------------------------------------
// <copyright file="ConversationMessage.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Represents a message in the conversation history.
/// </summary>
public sealed record ConversationMessage
{
    /// <summary>Gets the message content.</summary>
    public required string Content { get; init; }

    /// <summary>Gets a value indicating whether the message is from the lead (true) or agent/AI (false).</summary>
    public required bool IsFromLead { get; init; }

    /// <summary>Gets the timestamp of the message.</summary>
    public required DateTime Timestamp { get; init; }
}

