// -----------------------------------------------------------------------
// <copyright file="IAICrmEnrichmentService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for AI-powered CRM data enrichment from conversations.
/// Extracts and enriches contact, company, and deal information.
/// </summary>
public interface IAICrmEnrichmentService
{
    /// <summary>
    /// Enriches CRM data by analyzing conversation content and extracting
    /// structured information like company name, job title, budget, and timeline.
    /// </summary>
    /// <param name="request">The enrichment request with conversation and entity IDs.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enrichment result with field suggestions and confidence scores.</returns>
    Task<CrmEnrichmentResult> EnrichFromConversationAsync(
        CrmEnrichmentRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Applies accepted enrichment suggestions to the specified entities.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="leadId">Optional lead ID to update.</param>
    /// <param name="contactId">Optional contact ID to update.</param>
    /// <param name="dealId">Optional deal ID to update.</param>
    /// <param name="acceptedSuggestions">List of accepted field suggestions to apply.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if updates were applied successfully.</returns>
    Task<bool> ApplyEnrichmentAsync(
        Guid businessId,
        Guid? leadId,
        Guid? contactId,
        Guid? dealId,
        IReadOnlyList<CrmFieldSuggestion> acceptedSuggestions,
        CancellationToken cancellationToken = default);
}

