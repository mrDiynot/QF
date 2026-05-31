// <copyright file="ExportResult.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.DataExport.DTOs;

/// <summary>
/// Result DTO for data export.
/// </summary>
public record ExportResult
{
    /// <summary>
    /// Gets the export file name.
    /// </summary>
    public required string FileName { get; init; }

    /// <summary>
    /// Gets the export file content type (MIME type).
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// Gets the export file content as byte array.
    /// </summary>
    public required IReadOnlyList<byte> FileContent { get; init; }

    /// <summary>
    /// Gets the number of records exported.
    /// </summary>
    public required int RecordCount { get; init; }

    /// <summary>
    /// Gets the file size in bytes.
    /// </summary>
    public int FileSizeBytes => FileContent.Count;
}

