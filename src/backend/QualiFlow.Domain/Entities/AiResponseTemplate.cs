// <copyright file="AiResponseTemplate.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an AI response template for automated conversations.
/// Templates contain prompts that guide AI responses for specific scenarios.
/// </summary>
public class AiResponseTemplate : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the category for organizing templates.
    /// Examples: "greeting", "qualification", "objection_handling", "follow_up", "closing".
    /// </summary>
    public string Category { get; set; } = "general";

    /// <summary>
    /// Gets or sets the AI prompt template.
    /// Supports variables: {{leadName}}, {{businessName}}, {{productName}}, etc.
    /// </summary>
    public string Prompt { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the available variables as JSON array.
    /// Example: ["leadName", "businessName", "productName"].
    /// </summary>
    public string VariablesJson { get; set; } = "[]";

    /// <summary>
    /// Gets or sets the AI tone for this template.
    /// Examples: "professional", "friendly", "casual", "formal".
    /// </summary>
    public string Tone { get; set; } = "professional";

    /// <summary>
    /// Gets or sets the maximum tokens for the AI response.
    /// </summary>
    public int MaxTokens { get; set; } = 150;

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the sort order for display purposes.
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Gets or sets the usage count for analytics.
    /// </summary>
    public int UsageCount { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this template belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;
}
