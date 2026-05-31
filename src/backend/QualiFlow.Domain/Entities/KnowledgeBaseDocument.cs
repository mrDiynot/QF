// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Knowledge base document for RAG (Retrieval Augmented Generation).
/// </summary>
public class KnowledgeBaseDocument : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the document title.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the full document content.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the document category.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets tags for this document.
    /// </summary>
    public IList<string> Tags { get; } = new List<string>();

    /// <summary>
    /// Gets or sets the source URL if applicable.
    /// </summary>
#pragma warning disable CA1056 // Uri properties should not be strings - used for display/logging
    public string? SourceUrl { get; set; }
#pragma warning restore CA1056

    /// <summary>
    /// Gets or sets a value indicating whether this document is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Business Business { get; set; } = null!;
    public ICollection<KnowledgeBaseChunk> Chunks { get; } = new List<KnowledgeBaseChunk>();
}
