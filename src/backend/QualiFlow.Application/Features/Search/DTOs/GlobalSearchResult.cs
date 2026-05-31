// <copyright file="GlobalSearchResult.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Search.DTOs;

/// <summary>
/// Response DTO for global search results.
/// </summary>
public record GlobalSearchResult
{
    /// <summary>
    /// Gets the entity ID.
    /// </summary>
    public required Guid Id { get; init; }

    /// <summary>
    /// Gets the entity type (Lead, Conversation, Message, Contact, Deal).
    /// </summary>
    public required string EntityType { get; init; }

    /// <summary>
    /// Gets the primary display text (name, title, or content preview).
    /// </summary>
    public required string Title { get; init; }

    /// <summary>
    /// Gets the secondary display text (email, phone, or additional context).
    /// </summary>
    public string? Subtitle { get; init; }

    /// <summary>
    /// Gets the highlighted snippet showing the match.
    /// </summary>
    public string? Snippet { get; init; }

    /// <summary>
    /// Gets the relevance score (0-1, higher is more relevant).
    /// </summary>
    public float Relevance { get; init; }

    /// <summary>
    /// Gets the entity creation date.
    /// </summary>
    public DateTime CreatedAt { get; init; }

    /// <summary>
    /// Gets additional metadata as key-value pairs.
    /// </summary>
    public IReadOnlyDictionary<string, string>? Metadata { get; init; }
}

