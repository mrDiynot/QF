// <copyright file="BulkDeleteRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.BulkOperations.DTOs;

/// <summary>
/// Request DTO for bulk deleting entities.
/// </summary>
public record BulkDeleteRequest
{
    /// <summary>
    /// Gets the list of entity IDs to delete.
    /// </summary>
    public required IReadOnlyList<Guid> EntityIds { get; init; }

    /// <summary>
    /// Gets a value indicating whether to perform hard delete (default: false = soft delete).
    /// </summary>
    public bool HardDelete { get; init; }
}

