// -----------------------------------------------------------------------
// <copyright file="IAIReportGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service interface for AI-powered report generation.
/// Generates comprehensive business reports with insights, charts, and recommendations.
/// </summary>
public interface IAIReportGenerationService
{
    /// <summary>
    /// Generates a business report using AI based on the specified parameters.
    /// </summary>
    /// <param name="request">The report generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated report with insights and recommendations.</returns>
    Task<ReportGenerationResult> GenerateReportAsync(
        ReportGenerationRequest request,
        CancellationToken cancellationToken = default);
}

