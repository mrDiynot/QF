// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Pgvector;
using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Chunk of a knowledge base document with vector embedding for RAG.
/// Large documents are split into chunks for better retrieval.
/// </summary>
public class KnowledgeBaseChunk : BaseEntity
{
    /// <summary>
    /// Gets or sets the parent document ID.
    /// </summary>
    public Guid DocumentId { get; set; }

    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the chunk text content.
    /// </summary>
    public string ChunkText { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the chunk index in the document.
    /// </summary>
    public int ChunkIndex { get; set; }

    /// <summary>
    /// Gets or sets the vector embedding for semantic similarity search.
    /// </summary>
    public Vector? Embedding { get; set; }

    /// <summary>
    /// Gets or sets the estimated token count for this chunk.
    /// </summary>
    public int TokenCount { get; set; }

    // Navigation properties
    public KnowledgeBaseDocument Document { get; set; } = null!;
    public Business Business { get; set; } = null!;
}
