// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Pgvector;
using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Long-term conversation memory with vector embeddings for semantic recall.
/// </summary>
public class ConversationMemory : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the chat session ID.
    /// </summary>
    public Guid SessionId { get; set; }

    /// <summary>
    /// Gets or sets the lead ID if linked to a lead.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation summary.
    /// </summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>
    /// Gets key points extracted from the conversation.
    /// </summary>
    public IList<string> KeyPoints { get; } = new List<string>();

    /// <summary>
    /// Gets or sets the vector embedding for semantic similarity search.
    /// </summary>
    public Vector? Embedding { get; set; }

    /// <summary>
    /// Gets or sets the importance score (0-1, higher = more important).
    /// </summary>
    public float ImportanceScore { get; set; } = 0.5f;

    /// <summary>
    /// Gets or sets when this memory expires (null = never).
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public ChatSession Session { get; set; } = null!;
    public Lead? Lead { get; set; }
}
