// -----------------------------------------------------------------------
// <copyright file="QualifyLeadRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for lead qualification through AI analysis.
/// </summary>
public sealed record QualifyLeadRequest
{
    /// <summary>Gets the lead ID to qualify.</summary>
    public required Guid LeadId { get; init; }

    /// <summary>Gets the business ID (tenant) for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>
    /// Gets a value indicating whether to force re-qualification even if cached result exists.
    /// </summary>
    public bool ForceRequalify { get; init; }

    /// <summary>Gets the optional conversation ID to use for qualification.</summary>
    /// <remarks>If not specified, the most recent conversation will be used.</remarks>
    public Guid? ConversationId { get; init; }
}

