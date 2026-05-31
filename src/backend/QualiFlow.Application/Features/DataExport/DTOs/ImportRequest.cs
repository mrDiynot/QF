// <copyright file="ImportRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.DataExport.DTOs;

/// <summary>
/// Request DTO for data import.
/// </summary>
public record ImportRequest
{
    /// <summary>
    /// Gets the entity type to import (Lead, Contact, Deal).
    /// </summary>
    public required string EntityType { get; init; }

    /// <summary>
    /// Gets the import file content as byte array.
    /// </summary>
    public required IReadOnlyList<byte> FileContent { get; init; }

    /// <summary>
    /// Gets the import file name.
    /// </summary>
    public required string FileName { get; init; }

    /// <summary>
    /// Gets a value indicating whether to skip duplicate records (default: true).
    /// </summary>
    public bool SkipDuplicates { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether to update existing records (default: false).
    /// </summary>
    public bool UpdateExisting { get; init; }
}

