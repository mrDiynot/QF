// <copyright file="GlobalSearchRequest.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Search.DTOs;

/// <summary>
/// Request DTO for global search across all entities.
/// </summary>
public record GlobalSearchRequest
{
    /// <summary>
    /// Gets the search query string.
    /// </summary>
    public required string Query { get; init; }

    /// <summary>
    /// Gets the entity types to search in (null = all types).
    /// </summary>
    public IReadOnlyList<string>? EntityTypes { get; init; }

    /// <summary>
    /// Gets the page number (1-based).
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets the start date filter (optional).
    /// </summary>
    public DateTime? StartDate { get; init; }

    /// <summary>
    /// Gets the end date filter (optional).
    /// </summary>
    public DateTime? EndDate { get; init; }
}

