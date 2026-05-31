// <copyright file="BulkOperationResult.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.BulkOperations.DTOs;

/// <summary>
/// Result DTO for bulk operations.
/// </summary>
public record BulkOperationResult
{
    /// <summary>
    /// Gets the total number of entities processed.
    /// </summary>
    public required int TotalProcessed { get; init; }

    /// <summary>
    /// Gets the number of successful operations.
    /// </summary>
    public required int SuccessCount { get; init; }

    /// <summary>
    /// Gets the number of failed operations.
    /// </summary>
    public required int FailureCount { get; init; }

    /// <summary>
    /// Gets the list of errors (entity ID and error message).
    /// </summary>
    public IReadOnlyList<BulkOperationError>? Errors { get; init; }

    /// <summary>
    /// Gets the background job ID (if operation is async).
    /// </summary>
    public string? JobId { get; init; }

    /// <summary>
    /// Gets a value indicating whether the operation was processed asynchronously.
    /// </summary>
    public bool IsAsync { get; init; }
}

/// <summary>
/// Error details for a failed bulk operation.
/// </summary>
public record BulkOperationError
{
    /// <summary>
    /// Gets the entity ID that failed.
    /// </summary>
    public required Guid EntityId { get; init; }

    /// <summary>
    /// Gets the error message.
    /// </summary>
    public required string ErrorMessage { get; init; }
}

