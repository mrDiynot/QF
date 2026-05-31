// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using Pgvector;
using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// FAQ with vector embedding for semantic search.
/// </summary>
public class FaqEmbedding : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID this FAQ belongs to.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the FAQ question.
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the FAQ answer.
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the vector embedding for semantic similarity search.
    /// </summary>
    public Vector? Embedding { get; set; }

    /// <summary>
    /// Gets or sets the category of this FAQ.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets tags for this FAQ.
    /// </summary>
    public IList<string> Tags { get; } = new List<string>();

    /// <summary>
    /// Gets or sets a value indicating whether this FAQ is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Business Business { get; set; } = null!;
}
