// <copyright file="ImportResult.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.DataExport.DTOs;

/// <summary>
/// Result DTO for data import.
/// </summary>
public record ImportResult
{
    /// <summary>
    /// Gets the total number of records in the import file.
    /// </summary>
    public required int TotalRecords { get; init; }

    /// <summary>
    /// Gets the number of records successfully imported.
    /// </summary>
    public required int ImportedCount { get; init; }

    /// <summary>
    /// Gets the number of records skipped (duplicates).
    /// </summary>
    public required int SkippedCount { get; init; }

    /// <summary>
    /// Gets the number of records that failed validation.
    /// </summary>
    public required int FailedCount { get; init; }

    /// <summary>
    /// Gets the list of validation errors.
    /// </summary>
    public IReadOnlyList<ImportError>? Errors { get; init; }
}

/// <summary>
/// Error details for a failed import record.
/// </summary>
public record ImportError
{
    /// <summary>
    /// Gets the row number in the import file (1-based).
    /// </summary>
    public required int RowNumber { get; init; }

    /// <summary>
    /// Gets the error message.
    /// </summary>
    public required string ErrorMessage { get; init; }

    /// <summary>
    /// Gets the raw data from the import file.
    /// </summary>
    public IReadOnlyDictionary<string, string>? RawData { get; init; }
}

