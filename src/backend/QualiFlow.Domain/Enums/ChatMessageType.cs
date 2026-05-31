// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the type of chat message.
/// </summary>
public enum ChatMessageType
{
    /// <summary>
    /// Message sent by the visitor.
    /// </summary>
    Visitor = 0,

    /// <summary>
    /// Message sent by AI assistant.
    /// </summary>
    AI = 1,

    /// <summary>
    /// Message sent by human agent.
    /// </summary>
    Agent = 2,

    /// <summary>
    /// System message (e.g., "Agent joined the chat").
    /// </summary>
    System = 3,

    /// <summary>
    /// Automated greeting message.
    /// </summary>
    Greeting = 4,

    /// <summary>
    /// Pre-chat form response.
    /// </summary>
    PreChatForm = 5
}

