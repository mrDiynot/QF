// -----------------------------------------------------------------------
// <copyright file="AIKnowledgeGenerationController.cs" company="QualiFlow">
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
/// Controller for AI-powered knowledge base content generation.
/// Provides endpoints for generating articles and extracting FAQs from conversations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai/generate")]
[Authorize]
[Produces("application/json")]
public class AIKnowledgeGenerationController : ControllerBase
{
    private readonly IAIKnowledgeGenerationService _knowledgeService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AIKnowledgeGenerationController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIKnowledgeGenerationController"/> class.
    /// </summary>
    public AIKnowledgeGenerationController(
        IAIKnowledgeGenerationService knowledgeService,
        ICurrentUserService currentUserService,
        ILogger<AIKnowledgeGenerationController> logger)
    {
        _knowledgeService = knowledgeService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Generates a knowledge base article using AI.
    /// </summary>
    /// <param name="request">The article generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated article result.</returns>
    /// <response code="200">Article generated successfully.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="429">AI usage limit exceeded.</response>
    [HttpPost("knowledge-article")]
    [ProducesResponseType(typeof(KnowledgeArticleResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<KnowledgeArticleResult>> GenerateKnowledgeArticle(
        [FromBody] KnowledgeGenerationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Topic))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "Topic is required for article generation.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "Generating knowledge article for business {BusinessId}: topic={Topic}",
            businessId,
            request.Topic);

        var result = await _knowledgeService.GenerateArticleAsync(businessId, request, cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
                {
                    Title = "Usage Limit Exceeded",
                    Detail = result.ErrorMessage ?? "AI usage limit exceeded for this billing period.",
                    Status = StatusCodes.Status429TooManyRequests,
                });
            }

            return BadRequest(new ProblemDetails
            {
                Title = "Generation Failed",
                Detail = result.ErrorMessage ?? "Failed to generate article.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Extracts FAQs from conversation history using AI analysis.
    /// </summary>
    /// <param name="request">The FAQ extraction request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The extracted FAQs result.</returns>
    /// <response code="200">FAQs extracted successfully.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="429">AI usage limit exceeded.</response>
    [HttpPost("extract-faqs")]
    [ProducesResponseType(typeof(ExtractFaqsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ExtractFaqsResult>> ExtractFaqs(
        [FromBody] ExtractFaqsRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "Extracting FAQs for business {BusinessId}: days={Days}, maxFaqs={MaxFaqs}",
            businessId,
            request.DaysToAnalyze,
            request.MaxFaqs);

        var result = await _knowledgeService.ExtractFaqsFromConversationsAsync(businessId, request, cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
                {
                    Title = "Usage Limit Exceeded",
                    Detail = result.ErrorMessage ?? "AI usage limit exceeded for this billing period.",
                    Status = StatusCodes.Status429TooManyRequests,
                });
            }

            return BadRequest(new ProblemDetails
            {
                Title = "Extraction Failed",
                Detail = result.ErrorMessage ?? "Failed to extract FAQs.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }
}

