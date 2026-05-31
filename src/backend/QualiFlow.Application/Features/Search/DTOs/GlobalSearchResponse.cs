// <copyright file="GlobalSearchResponse.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

namespace QualiFlow.Application.Features.Search.DTOs;

/// <summary>
/// Paginated response for global search results.
/// </summary>
public record GlobalSearchResponse
{
    /// <summary>
    /// Gets the search results.
    /// </summary>
    public required IReadOnlyList<GlobalSearchResult> Results { get; init; }

    /// <summary>
    /// Gets the total number of results across all pages.
    /// </summary>
    public required int TotalResults { get; init; }

    /// <summary>
    /// Gets the current page number (1-based).
    /// </summary>
    public required int Page { get; init; }

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public required int PageSize { get; init; }

    /// <summary>
    /// Gets the total number of pages.
    /// </summary>
    public int TotalPages => (int)Math.Ceiling(TotalResults / (double)PageSize);

    /// <summary>
    /// Gets a value indicating whether there is a next page.
    /// </summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Gets a value indicating whether there is a previous page.
    /// </summary>
    public bool HasPreviousPage => Page > 1;

    /// <summary>
    /// Gets the search query that was executed.
    /// </summary>
    public required string Query { get; init; }

    /// <summary>
    /// Gets the entity types that were searched.
    /// </summary>
    public IReadOnlyList<string>? EntityTypes { get; init; }
}

