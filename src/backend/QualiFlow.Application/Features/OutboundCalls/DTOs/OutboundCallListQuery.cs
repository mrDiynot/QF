// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.OutboundCalls.DTOs;

/// <summary>
/// Query parameters for listing outbound calls.
/// </summary>
public record OutboundCallListQuery
{
    /// <summary>
    /// Gets the page number (1-based).
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Gets the page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets the lead ID filter.
    /// </summary>
    public Guid? LeadId { get; init; }

    /// <summary>
    /// Gets the status filter.
    /// </summary>
    public OutboundCallStatus? Status { get; init; }

    /// <summary>
    /// Gets the outcome filter.
    /// </summary>
    public OutboundCallOutcome? Outcome { get; init; }

    /// <summary>
    /// Gets the start date filter.
    /// </summary>
    public DateTime? FromDate { get; init; }

    /// <summary>
    /// Gets the end date filter.
    /// </summary>
    public DateTime? ToDate { get; init; }

    /// <summary>
    /// Gets the sort field.
    /// </summary>
    public string SortBy { get; init; } = "CreatedAt";

    /// <summary>
    /// Gets a value indicating whether to sort descending.
    /// </summary>
    public bool SortDescending { get; init; } = true;
}

