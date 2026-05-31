// -----------------------------------------------------------------------
// <copyright file="IAISmsTemplateGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for generating SMS templates using AI.
/// Generates multiple template variations based on purpose, industry, and tone.
/// </summary>
public interface IAISmsTemplateGenerationService
{
    /// <summary>
    /// Generates SMS templates using AI based on the provided request.
    /// </summary>
    /// <param name="request">The generation request with purpose, industry, and options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generation result with templates or error information.</returns>
    Task<SmsTemplateGenerationResult> GenerateSmsTemplatesAsync(
        GenerateSmsTemplateRequest request,
        CancellationToken cancellationToken = default);
}

