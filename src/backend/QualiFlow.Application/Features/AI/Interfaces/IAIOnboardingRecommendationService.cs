// -----------------------------------------------------------------------
// <copyright file="IAIOnboardingRecommendationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for generating AI-powered onboarding recommendations.
/// Analyzes business profile to recommend optimal channels, workflows, and configurations.
/// </summary>
public interface IAIOnboardingRecommendationService
{
    /// <summary>
    /// Generates personalized onboarding recommendations based on business profile.
    /// </summary>
    /// <param name="request">The recommendation request with business details.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Recommendations for channels, workflows, forms, and AI configuration.</returns>
    Task<OnboardingRecommendationResult> GetRecommendationsAsync(
        OnboardingRecommendationRequest request,
        CancellationToken cancellationToken = default);
}

