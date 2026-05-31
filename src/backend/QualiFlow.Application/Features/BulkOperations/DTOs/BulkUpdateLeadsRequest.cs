// <copyright file="BulkUpdateLeadsRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.BulkOperations.DTOs;

/// <summary>
/// Request DTO for bulk updating leads.
/// </summary>
public record BulkUpdateLeadsRequest
{
    /// <summary>
    /// Gets the list of lead IDs to update.
    /// </summary>
    public required IReadOnlyList<Guid> LeadIds { get; init; }

    /// <summary>
    /// Gets the new status to apply (optional).
    /// </summary>
    public LeadStatus? Status { get; init; }

    /// <summary>
    /// Gets the new assigned user ID (optional).
    /// </summary>
    public Guid? AssignedUserId { get; init; }

    /// <summary>
    /// Gets the tags to add (optional).
    /// </summary>
    public IReadOnlyList<string>? TagsToAdd { get; init; }

    /// <summary>
    /// Gets the tags to remove (optional).
    /// </summary>
    public IReadOnlyList<string>? TagsToRemove { get; init; }

    /// <summary>
    /// Gets the custom fields to update (optional).
    /// </summary>
    public IReadOnlyDictionary<string, string>? CustomFields { get; init; }
}

