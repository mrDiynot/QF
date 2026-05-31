// -----------------------------------------------------------------------
// <copyright file="BusinessKnowledgeBase.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Knowledge base entry for a business to provide AI context.
/// Stores FAQs, product info, services, pricing, and competitor data.
/// </summary>
public class BusinessKnowledgeBase : BaseEntity
{
    /// <summary>Gets or sets the business ID (tenant) this entry belongs to.</summary>
    public Guid BusinessId { get; set; }

    /// <summary>Gets or sets the type of knowledge entry.</summary>
    public KnowledgeEntryType EntryType { get; set; }

    /// <summary>Gets or sets the title/question for this entry.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Gets or sets the content/answer for this entry.</summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>Gets or sets the category for grouping entries.</summary>
    public string? Category { get; set; }

    /// <summary>Gets or sets tags for search and filtering.</summary>
    public string? Tags { get; set; }

    /// <summary>Gets or sets the priority for AI context inclusion (higher = more important).</summary>
    public int Priority { get; set; } = 50;

    /// <summary>Gets or sets a value indicating whether this entry is active.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Gets or sets the display order within category.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets associated keywords for AI matching.</summary>
    public string? Keywords { get; set; }

    /// <summary>Gets or sets metadata as JSON (pricing tiers, competitor details, etc.).</summary>
    public string? MetadataJson { get; set; }

    // Navigation Properties

    /// <summary>Gets or sets the business this entry belongs to.</summary>
    public Business Business { get; set; } = null!;
}
