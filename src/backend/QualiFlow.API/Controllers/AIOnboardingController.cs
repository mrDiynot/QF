// -----------------------------------------------------------------------
// <copyright file="AIOnboardingController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for AI-powered onboarding recommendations.
/// Provides personalized channel, workflow, and configuration recommendations based on business profile.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai/enhance")]
[Authorize]
[Produces("application/json")]
public class AIOnboardingController : ControllerBase
{
    private readonly IAIOnboardingRecommendationService _recommendationService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AIOnboardingController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIOnboardingController"/> class.
    /// </summary>
    public AIOnboardingController(
        IAIOnboardingRecommendationService recommendationService,
        ICurrentUserService currentUserService,
        ILogger<AIOnboardingController> logger)
    {
        _recommendationService = recommendationService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Generates AI-powered onboarding recommendations based on business profile.
    /// </summary>
    /// <param name="request">The onboarding recommendation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Personalized recommendations for channels, workflows, forms, and AI configuration.</returns>
    /// <remarks>
    /// This endpoint analyzes the business profile (industry, goals, lead type) and returns:
    /// - Recommended communication channels with priority scores
    /// - Workflow templates tailored to the business type
    /// - Form configurations with BANT qualification fields
    /// - AI configuration settings (tone, threshold, scoring weights)
    /// - Automation priorities with quick wins identified.
    /// </remarks>
    /// <response code="200">Recommendations generated successfully.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="429">AI usage limit exceeded.</response>
    [HttpPost("onboarding")]
    [ProducesResponseType(typeof(OnboardingRecommendationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<OnboardingRecommendationResult>> GetOnboardingRecommendations(
        [FromBody] OnboardingRecommendationApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        if (businessId == Guid.Empty)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Unauthorized",
                Detail = "Business context not found.",
                Status = StatusCodes.Status401Unauthorized,
            });
        }

        if (string.IsNullOrWhiteSpace(request.Industry))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "Industry is required for generating recommendations.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        _logger.LogInformation(
            "Generating onboarding recommendations for business {BusinessId}, industry: {Industry}",
            businessId,
            request.Industry);

        var serviceRequest = new OnboardingRecommendationRequest
        {
            BusinessId = businessId,
            Industry = request.Industry,
            CompanySize = request.CompanySize,
            Goals = request.Goals ?? [],
            LeadType = request.LeadType,
            MainObjective = request.MainObjective,
            LeadSources = request.LeadSources ?? [],
            TargetAudience = request.TargetAudience,
        };

        var result = await _recommendationService.GetRecommendationsAsync(serviceRequest, cancellationToken);

        if (!result.Success)
        {
            if (result.ErrorMessage?.Contains("limit", StringComparison.OrdinalIgnoreCase) == true)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
                {
                    Title = "Usage Limit Exceeded",
                    Detail = result.ErrorMessage,
                    Status = StatusCodes.Status429TooManyRequests,
                });
            }

            return BadRequest(new ProblemDetails
            {
                Title = "Generation Failed",
                Detail = result.ErrorMessage ?? "Failed to generate recommendations.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }
}

/// <summary>
/// API request for onboarding recommendations.
/// </summary>
public sealed record OnboardingRecommendationApiRequest
{
    /// <summary>Gets the industry/business type.</summary>
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "Industry is required")]
    public string Industry { get; init; } = string.Empty;

    /// <summary>Gets the company size.</summary>
    public string? CompanySize { get; init; }

    /// <summary>Gets the business goals (multi-select).</summary>
    public IReadOnlyList<string>? Goals { get; init; }

    /// <summary>Gets the lead type (B2B, B2C, or Both).</summary>
    public string? LeadType { get; init; }

    /// <summary>Gets the main objective.</summary>
    public string? MainObjective { get; init; }

    /// <summary>Gets the current lead sources.</summary>
    public IReadOnlyList<string>? LeadSources { get; init; }

    /// <summary>Gets the target audience description.</summary>
    public string? TargetAudience { get; init; }
}

