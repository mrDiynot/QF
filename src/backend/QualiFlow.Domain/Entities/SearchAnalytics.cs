// <copyright file="SearchAnalytics.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents search analytics for tracking search queries and performance (S15-BE-004).
/// </summary>
public class SearchAnalytics : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// CRITICAL: Required for multi-tenancy isolation.
    /// </summary>
    public required Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who performed the search.
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the search query text.
    /// </summary>
    public required string SearchQuery { get; set; }

    /// <summary>
    /// Gets or sets the entity type searched (Lead, Contact, Conversation, Message, Deal).
    /// </summary>
    public required string EntityType { get; set; }

    /// <summary>
    /// Gets or sets the number of results returned.
    /// </summary>
    public required int ResultsCount { get; set; }

    /// <summary>
    /// Gets or sets the search execution time in milliseconds.
    /// </summary>
    public required long ExecutionTimeMs { get; set; }

    /// <summary>
    /// Gets or sets the filters applied as JSON.
    /// Example: {"status": "qualified", "scoreMin": 70}.
    /// </summary>
    public string? FiltersJson { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the search was performed.
    /// </summary>
    public required DateTime SearchedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business (tenant) this search analytics belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who performed the search.
    /// </summary>
    public ApplicationUser? User { get; set; }
}

