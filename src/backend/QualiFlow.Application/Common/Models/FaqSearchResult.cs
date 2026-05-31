// -----------------------------------------------------------------------
// <copyright file="FaqSearchResult.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Common.Models;

/// <summary>
/// Result of an FAQ semantic search query.
/// </summary>
public sealed class FaqSearchResult
{
    /// <summary>
    /// Gets or sets the FAQ ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the question.
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the answer.
    /// </summary>
    public string Answer { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the category.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Gets the tags.
    /// </summary>
    public IList<string> Tags { get; } = new List<string>();

    /// <summary>
    /// Gets or sets the similarity score (0-1, higher is better).
    /// </summary>
    public float Confidence { get; set; }
}
