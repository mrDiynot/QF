// <copyright file="ExportRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.DataExport.DTOs;

/// <summary>
/// Request DTO for data export.
/// </summary>
public record ExportRequest
{
    /// <summary>
    /// Gets the entity type to export (Lead, Conversation, Contact, Deal).
    /// </summary>
    public required string EntityType { get; init; }

    /// <summary>
    /// Gets the export format (CSV, Excel, JSON).
    /// </summary>
    public required string Format { get; init; }

    /// <summary>
    /// Gets the list of entity IDs to export (null = export all).
    /// </summary>
    public IReadOnlyList<Guid>? EntityIds { get; init; }

    /// <summary>
    /// Gets the start date filter (optional).
    /// </summary>
    public DateTime? StartDate { get; init; }

    /// <summary>
    /// Gets the end date filter (optional).
    /// </summary>
    public DateTime? EndDate { get; init; }

    /// <summary>
    /// Gets the list of fields to include (null = all fields).
    /// </summary>
    public IReadOnlyList<string>? Fields { get; init; }
}

