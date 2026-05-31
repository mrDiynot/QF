// -----------------------------------------------------------------------
// <copyright file="ConversationListResponse.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Paginated response for enhanced conversation list.
/// </summary>
public sealed record ConversationListResponse
{
    /// <summary>Gets the list of conversations.</summary>
    public IReadOnlyList<ConversationListItemResponse> Items { get; init; } = [];

    /// <summary>Gets the total number of conversations.</summary>
    public int TotalCount { get; init; }

    /// <summary>Gets the current page number.</summary>
    public int Page { get; init; }

    /// <summary>Gets the page size.</summary>
    public int PageSize { get; init; }

    /// <summary>Gets the total number of pages.</summary>
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    /// <summary>Gets a value indicating whether there's a next page.</summary>
    public bool HasNextPage => Page < TotalPages;

    /// <summary>Gets a value indicating whether there's a previous page.</summary>
    public bool HasPreviousPage => Page > 1;

    /// <summary>Gets the total unread count across all conversations.</summary>
    public int TotalUnreadCount { get; init; }

    /// <summary>Gets the total number of active (Open) conversations.</summary>
    public int TotalActive { get; init; }

    /// <summary>Gets the total number of closed/archived conversations.</summary>
    public int TotalClosed { get; init; }
}

