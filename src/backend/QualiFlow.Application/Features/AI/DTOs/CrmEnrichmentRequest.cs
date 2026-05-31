// -----------------------------------------------------------------------
// <copyright file="CrmEnrichmentRequest.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

namespace QualiFlow.Application.Features.AI.DTOs;

/// <summary>
/// Request for AI-powered CRM data enrichment.
/// </summary>
public sealed record CrmEnrichmentRequest
{
    /// <summary>Gets the business ID for multi-tenancy.</summary>
    public required Guid BusinessId { get; init; }

    /// <summary>Gets the conversation ID to analyze.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the optional lead ID to enrich.</summary>
    public Guid? LeadId { get; init; }

    /// <summary>Gets the optional contact ID to enrich.</summary>
    public Guid? ContactId { get; init; }

    /// <summary>Gets the optional deal ID to enrich.</summary>
    public Guid? DealId { get; init; }

    /// <summary>Gets a value indicating whether to include company enrichment.</summary>
    public bool IncludeCompanyInfo { get; init; } = true;

    /// <summary>Gets a value indicating whether to include contact details enrichment.</summary>
    public bool IncludeContactDetails { get; init; } = true;

    /// <summary>Gets a value indicating whether to include deal signals enrichment.</summary>
    public bool IncludeDealSignals { get; init; } = true;

    /// <summary>Gets a value indicating whether to include BANT scoring.</summary>
    public bool IncludeBantScores { get; init; } = true;
}

