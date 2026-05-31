// <copyright file="SavedSearch.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a saved search query for quick access (S15-BE-003).
/// </summary>
public class SavedSearch : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// CRITICAL: Required for multi-tenancy isolation.
    /// </summary>
    public required Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who created this saved search.
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the name of the saved search.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the saved search.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the entity type to search (Lead, Contact, Conversation, Message, Deal).
    /// </summary>
    public required string EntityType { get; set; }

    /// <summary>
    /// Gets or sets the search criteria as JSON.
    /// Example: {"query": "john", "status": "qualified", "scoreMin": 70}.
    /// </summary>
    public required string SearchCriteriaJson { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this search is shared with other team members.
    /// </summary>
    public bool IsShared { get; set; }

    /// <summary>
    /// Gets or sets the last time this saved search was used.
    /// </summary>
    public DateTime? LastUsedAt { get; set; }

    /// <summary>
    /// Gets or sets the number of times this saved search has been executed.
    /// </summary>
    public int UsageCount { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business (tenant) this saved search belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the user who created this saved search.
    /// </summary>
    public ApplicationUser? User { get; set; }
}

