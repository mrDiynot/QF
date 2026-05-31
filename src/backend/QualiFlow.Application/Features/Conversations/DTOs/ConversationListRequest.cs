// -----------------------------------------------------------------------
// <copyright file="ConversationListRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Conversations.DTOs;

/// <summary>
/// Request for getting enhanced conversation list with filtering and sorting.
/// </summary>
public sealed record ConversationListRequest
{
    /// <summary>Gets the search term for lead name or email.</summary>
    public string? SearchTerm { get; init; }

    /// <summary>Gets the status filter.</summary>
    public ConversationStatus? Status { get; init; }

    /// <summary>Gets the channel filter.</summary>
    public string? Channel { get; init; }

    /// <summary>Gets the start date filter.</summary>
    public DateTime? DateFrom { get; init; }

    /// <summary>Gets the end date filter.</summary>
    public DateTime? DateTo { get; init; }

    /// <summary>Gets the sort field.</summary>
    public ConversationSortField SortBy { get; init; } = ConversationSortField.LastMessageAt;

    /// <summary>Gets the sort direction.</summary>
    public SortDirection SortDirection { get; init; } = SortDirection.Descending;

    /// <summary>Gets the page number (1-based).</summary>
    public int Page { get; init; } = 1;

    /// <summary>Gets the page size.</summary>
    public int PageSize { get; init; } = 10;
}

