// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using System.Collections.ObjectModel;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.ChatWidgets.DTOs;

/// <summary>
/// DTO for chat session response.
/// </summary>
public record ChatSessionDto
{
    public Guid Id { get; init; }
    public Guid ChatWidgetId { get; init; }
    public string SessionToken { get; init; } = string.Empty;
    public string? VisitorName { get; init; }
    public string? VisitorEmail { get; init; }
    public string? VisitorPhone { get; init; }
    public ChatSessionStatus Status { get; init; }

    /// <summary>
    /// Gets the page URL where the chat was initiated.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "DTO for JSON serialization")]
    public string? PageUrl { get; init; }

    public Guid? AssignedAgentId { get; init; }
    public string? AssignedAgentName { get; init; }
    public int? AIQualificationScore { get; init; }
    public Guid? LeadId { get; init; }
    public Guid? ConversationId { get; init; }
    public DateTime StartedAt { get; init; }
    public DateTime LastActivityAt { get; init; }
    public DateTime? EndedAt { get; init; }
    public int MessageCount { get; init; }
}

/// <summary>
/// Request to start a new chat session.
/// </summary>
public record StartChatSessionRequest
{
    public string WidgetKey { get; init; } = string.Empty;
    public string? VisitorName { get; init; }
    public string? VisitorEmail { get; init; }
    public string? VisitorPhone { get; init; }

    /// <summary>
    /// Gets the page URL where the chat was initiated.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "DTO for JSON serialization")]
    public string? PageUrl { get; init; }

    /// <summary>
    /// Gets the referrer URL.
    /// </summary>
    [System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1056:URI-like properties should not be strings", Justification = "DTO for JSON serialization")]
    public string? ReferrerUrl { get; init; }

    /// <summary>
    /// Gets the visitor's IP address (set by server).
    /// </summary>
    public string? IpAddress { get; init; }

    /// <summary>
    /// Gets the visitor's user agent (set by server).
    /// </summary>
    public string? UserAgent { get; init; }

    public IDictionary<string, string>? PreChatFormData { get; init; }
}

/// <summary>
/// Response when starting a chat session.
/// </summary>
public record StartChatSessionResponse
{
    public Guid SessionId { get; init; }
    public string SessionToken { get; init; } = string.Empty;
    public string? GreetingMessage { get; init; }
    public bool EnableAIResponses { get; init; }
}

/// <summary>
/// Request to send a chat message.
/// </summary>
public record SendChatMessageRequest
{
    public string SessionToken { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
    public IReadOnlyCollection<string>? AttachmentUrls { get; init; }
}

/// <summary>
/// DTO for chat message response.
/// </summary>
public record ChatMessageDto
{
    public Guid Id { get; init; }
    public Guid ChatSessionId { get; init; }
    public string Content { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string SenderId { get; init; } = string.Empty;
    public string? SenderName { get; init; }
    public DateTime SentAt { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
    public IReadOnlyCollection<string>? Attachments { get; init; }
    public string? DetectedIntent { get; init; }
    public float? SentimentScore { get; init; }
}

/// <summary>
/// Request to transfer chat to agent.
/// </summary>
public record TransferToAgentRequest
{
    public Guid SessionId { get; init; }
    public Guid? AgentId { get; init; }
    public string? Reason { get; init; }
}

/// <summary>
/// Request to end a chat session.
/// </summary>
public record EndChatSessionRequest
{
    public string SessionToken { get; init; } = string.Empty;
    public string? Reason { get; init; }
}

/// <summary>
/// Chat session summary for list views.
/// </summary>
public record ChatSessionSummaryDto
{
    public Guid Id { get; init; }
    public string? VisitorName { get; init; }
    public string? VisitorEmail { get; init; }
    public ChatSessionStatus Status { get; init; }
    public string? LastMessage { get; init; }
    public DateTime LastActivityAt { get; init; }
    public int UnreadCount { get; init; }
    public int? AIQualificationScore { get; init; }
}

