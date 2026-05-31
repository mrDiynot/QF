// -----------------------------------------------------------------------
// <copyright file="AIController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Interfaces;
using System.Collections.Generic;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for AI-powered operations using OpenAI.
/// Provides endpoints for lead qualification, conversation analysis, intent detection,
/// sentiment analysis, AI response generation, feedback collection, and AI generation.
/// </summary>
/// <remarks>
/// This controller exposes the core AI capabilities of QualiFlow:
/// - Lead Qualification: BANT scoring with evidence-based reasoning
/// - Conversation Analysis: Intent detection, sentiment analysis, entity extraction
/// - AI Response Generation: Context-aware suggested responses for agents
/// - Feedback Collection: Record user feedback on AI-generated content (Sprint 38)
/// - AI Form Generation: Generate lead capture forms using AI (Sprint 38 - Story 1.1)
/// - Real-time Processing: All operations use OpenAI for intelligent analysis.
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer")]
public class AIController : ControllerBase
{
    private readonly IAIConversationService _aiConversationService;
    private readonly IOpenAIService _openAIService;
    private readonly IAIFeedbackService _feedbackService;
    private readonly IAIFormGenerationService _formGenerationService;
    private readonly IAISmsTemplateGenerationService _smsTemplateGenerationService;
    private readonly IAIInsightsService _insightsService;
    private readonly IAIReportGenerationService _reportGenerationService;
    private readonly IAICrmEnrichmentService _crmEnrichmentService;
    private readonly IAIQuickReplySuggestionService _quickReplySuggestionService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AIController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="AIController"/> class.
    /// </summary>
    public AIController(
        IAIConversationService aiConversationService,
        IOpenAIService openAIService,
        IAIFeedbackService feedbackService,
        IAIFormGenerationService formGenerationService,
        IAISmsTemplateGenerationService smsTemplateGenerationService,
        IAIInsightsService insightsService,
        IAIReportGenerationService reportGenerationService,
        IAICrmEnrichmentService crmEnrichmentService,
        IAIQuickReplySuggestionService quickReplySuggestionService,
        ICurrentUserService currentUserService,
        ILogger<AIController> logger)
    {
        _aiConversationService = aiConversationService;
        _openAIService = openAIService;
        _feedbackService = feedbackService;
        _formGenerationService = formGenerationService;
        _smsTemplateGenerationService = smsTemplateGenerationService;
        _insightsService = insightsService;
        _reportGenerationService = reportGenerationService;
        _crmEnrichmentService = crmEnrichmentService;
        _quickReplySuggestionService = quickReplySuggestionService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <summary>
    /// Qualifies a lead using AI-powered BANT analysis.
    /// </summary>
    /// <param name="request">The qualification request with lead and conversation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Qualification result with score, reasoning, and suggested actions.</returns>
    /// <response code="200">Lead qualified successfully with AI analysis.</response>
    /// <response code="400">Invalid request parameters.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Lead or conversation not found.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/ai/qualify-lead
    ///     {
    ///         "leadId": "guid",
    ///         "conversationId": "guid (optional)",
    ///         "forceRequalify": false
    ///     }
    ///
    /// The AI analyzes the conversation history and scores the lead on:
    /// - Budget (25%): Financial capacity and willingness to invest
    /// - Authority (25%): Decision-making power
    /// - Need (25%): Clear pain points and requirements
    /// - Timeline (25%): Purchase readiness and urgency.
    /// </remarks>
    [HttpPost("qualify-lead")]
    [RequiresLimit("max_ai_conversations")] // Consumes AI conversation quota
    [ProducesResponseType(typeof(QualifyLeadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QualifyLeadResponse>> QualifyLead(
        [FromBody] QualifyLeadRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        request = request with { BusinessId = businessId };

        _logger.LogInformation(
            "AI Lead Qualification requested for Lead {LeadId} by Business {BusinessId}",
            request.LeadId, businessId);

        var result = await _aiConversationService.QualifyLeadAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Analyzes a conversation using AI to extract insights.
    /// </summary>
    /// <param name="conversationId">The conversation ID to analyze.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Analysis results including intent, sentiment, and entities.</returns>
    /// <response code="200">Conversation analyzed successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Conversation not found.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     GET /api/v1/ai/analyze-conversation/{conversationId}
    ///
    /// Returns:
    /// - Primary intent (pricing_inquiry, scheduling_request, etc.)
    /// - Sentiment (Positive, Negative, Neutral, Mixed)
    /// - Key topics extracted from conversation
    /// - Pain points identified
    /// - Extracted entities (budget, timeline, product interest).
    /// </remarks>
    [HttpGet("analyze-conversation/{conversationId:guid}")]
    [RequiresLimit("max_ai_conversations")] // Consumes AI conversation quota
    [ProducesResponseType(typeof(ConversationAnalysisResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ConversationAnalysisResponse>> AnalyzeConversation(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "AI Conversation Analysis requested for Conversation {ConversationId}",
            conversationId);

        var result = await _aiConversationService.AnalyzeConversationAsync(
            conversationId, businessId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Generates an AI-powered suggested response for an agent.
    /// </summary>
    /// <param name="request">The suggestion request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A suggested response with confidence score.</returns>
    /// <response code="200">Response suggestion generated successfully.</response>
    /// <response code="401">User is not authenticated.</response>
    /// <response code="404">Conversation not found.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/ai/suggest-response
    ///     {
    ///         "conversationId": "guid",
    ///         "tone": "professional" // Options: professional, friendly, formal
    ///     }
    ///
    /// The AI analyzes the conversation context and generates a contextually
    /// appropriate response that the agent can use or modify.
    /// </remarks>
    [HttpPost("suggest-response")]
    [RequiresLimit("max_ai_conversations")] // Consumes AI conversation quota
    [ProducesResponseType(typeof(SuggestedResponseResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SuggestedResponseResult>> SuggestResponse(
        [FromBody] SuggestResponseRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        _logger.LogInformation(
            "AI Response Suggestion requested for Conversation {ConversationId}",
            request.ConversationId);

        var result = await _aiConversationService.GenerateSuggestedResponseAsync(
            request.ConversationId, businessId, request.Tone, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Detects the intent of a message using AI.
    /// </summary>
    /// <param name="request">The intent detection request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Detected intent with confidence score.</returns>
    /// <response code="200">Intent detected successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/ai/detect-intent
    ///     {
    ///         "message": "I'm interested in scheduling a demo",
    ///         "conversationContext": ["Previous message 1", "Previous message 2"]
    ///     }
    ///
    /// Standard intent categories:
    /// - pricing_inquiry, scheduling_request, product_question
    /// - availability_check, support_request, complaint
    /// - budget_discussion, commitment_signal, objection_handling.
    /// </remarks>
    [HttpPost("detect-intent")]
    [ProducesResponseType(typeof(IntentDetectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IntentDetectionResponse>> DetectIntent(
        [FromBody] IntentDetectionRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Message is required");
        }

        _logger.LogInformation("AI Intent Detection requested");

        var result = await _openAIService.DetectIntentAsync(
            request.Message, request.ConversationContext, cancellationToken);

        return Ok(new IntentDetectionResponse
        {
            PrimaryIntent = result.PrimaryIntent,
            Confidence = result.Confidence,
            SecondaryIntents = result.SecondaryIntents?.Select(si => new SecondaryIntentDto
            {
                Intent = si.Intent,
                Confidence = si.Confidence,
            }).ToList(),
            ExtractedEntities = result.ExtractedEntities?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            DetectedAt = DateTime.UtcNow,
        });
    }

    /// <summary>
    /// Analyzes the sentiment of a message using AI.
    /// </summary>
    /// <param name="request">The sentiment analysis request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Sentiment analysis result.</returns>
    /// <response code="200">Sentiment analyzed successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/ai/analyze-sentiment
    ///     {
    ///         "message": "I'm really frustrated with the delays"
    ///     }
    ///
    /// Returns:
    /// - Sentiment: Positive, Negative, Neutral, or Mixed
    /// - Score: -1.0 (very negative) to 1.0 (very positive)
    /// - Emotions: List of detected emotions with intensity.
    /// </remarks>
    [HttpPost("analyze-sentiment")]
    [ProducesResponseType(typeof(SentimentAnalysisResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SentimentAnalysisResponse>> AnalyzeSentiment(
        [FromBody] SentimentAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Message is required");
        }

        _logger.LogInformation("AI Sentiment Analysis requested");

        var result = await _openAIService.AnalyzeSentimentAsync(request.Message, cancellationToken);

        return Ok(new SentimentAnalysisResponse
        {
            Sentiment = result.Sentiment,
            Score = result.Score,
            Confidence = result.Confidence,
            Emotions = result.Emotions?.Select(e => new EmotionDto
            {
                Emotion = e.Emotion,
                Intensity = e.Intensity,
            }).ToList(),
            AnalyzedAt = DateTime.UtcNow,
        });
    }

    /// <summary>
    /// Generates a custom AI completion.
    /// </summary>
    /// <param name="request">The completion request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated text completion.</returns>
    /// <response code="200">Completion generated successfully.</response>
    /// <response code="400">Invalid request.</response>
    /// <remarks>
    /// Sample request:
    ///
    ///     POST /api/v1/ai/generate
    ///     {
    ///         "prompt": "Write a follow-up email for a qualified lead",
    ///         "systemMessage": "You are a helpful sales assistant",
    ///         "maxTokens": 500,
    ///         "temperature": 0.7
    ///     }
    ///
    /// This is a general-purpose endpoint for custom AI generation needs.
    /// </remarks>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(AICompletionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AICompletionResponse>> GenerateCompletion(
        [FromBody] AICompletionRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest("Prompt is required");
        }

        _logger.LogInformation("AI Completion requested");

        var startTime = DateTime.UtcNow;
        var result = await _openAIService.GenerateCompletionAsync(
            request.Prompt,
            request.SystemMessage,
            request.MaxTokens ?? 1000,
            request.Temperature ?? 0.7f,
            cancellationToken);
        var latencyMs = (DateTime.UtcNow - startTime).TotalMilliseconds;

        return Ok(new AICompletionResponse
        {
            Content = result,
            GeneratedAt = DateTime.UtcNow,
            LatencyMs = latencyMs,
        });
    }

    /// <summary>
    /// Gets AI usage metrics for the business.
    /// </summary>
    /// <param name="startDate">Start date for metrics (optional, defaults to 30 days ago).</param>
    /// <param name="endDate">End date for metrics (optional, defaults to now).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>AI usage metrics including token counts and estimated costs.</returns>
    [HttpGet("usage")]
    [ProducesResponseType(typeof(AIUsageMetrics), StatusCodes.Status200OK)]
    public async Task<ActionResult<AIUsageMetrics>> GetUsageMetrics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var result = await _aiConversationService.GetUsageMetricsAsync(
            businessId, start, end, cancellationToken);
        return Ok(result);
    }

    // ========================================================================
    // AI Feedback Endpoints (Sprint 38 - Story 0.3)
    // ========================================================================

    /// <summary>
    /// Records user feedback on an AI generation.
    /// </summary>
    /// <param name="request">The feedback details including audit ID and feedback type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success status of feedback recording.</returns>
    /// <remarks>
    /// Feedback types: Accepted, Modified, Rejected, ThumbsUp, ThumbsDown.
    /// Use this endpoint after a user interacts with AI-generated content.
    /// </remarks>
    [HttpPost("feedback")]
    [ProducesResponseType(typeof(RecordFeedbackResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecordFeedbackResponse>> RecordFeedback(
        [FromBody] RecordFeedbackApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var result = await _feedbackService.RecordFeedbackAsync(
            new RecordFeedbackRequest
            {
                BusinessId = businessId,
                AuditId = request.AuditId,
                FeedbackType = request.FeedbackType,
                Comment = request.Comment,
                UserId = userId,
            },
            cancellationToken);

        if (!result)
        {
            return NotFound(new ProblemDetails
            {
                Title = "AI Generation Not Found",
                Detail = $"AI generation with ID {request.AuditId} was not found or feedback type is invalid.",
                Status = StatusCodes.Status404NotFound,
            });
        }

        return Ok(new RecordFeedbackResponse { Success = true, Message = "Feedback recorded successfully." });
    }

    /// <summary>
    /// Gets AI quality metrics for the business.
    /// </summary>
    /// <param name="startDate">Start date for metrics (optional, defaults to 30 days ago).</param>
    /// <param name="endDate">End date for metrics (optional, defaults to now).</param>
    /// <param name="taskType">Optional filter by task type.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Quality metrics including acceptance rates and satisfaction scores.</returns>
    [HttpGet("feedback/metrics")]
    [ProducesResponseType(typeof(AIQualityMetricsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AIQualityMetricsResponse>> GetQualityMetrics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? taskType,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        var result = await _feedbackService.GetQualityMetricsAsync(
            new GetQualityMetricsRequest
            {
                BusinessId = businessId,
                StartDate = start,
                EndDate = end,
                TaskType = taskType,
            },
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Gets a summary of AI feedback for dashboard display.
    /// </summary>
    /// <param name="daysBack">Number of days to look back (default: 30).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Feedback summary with counts and trends.</returns>
    [HttpGet("feedback/summary")]
    [ProducesResponseType(typeof(FeedbackSummaryResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<FeedbackSummaryResponse>> GetFeedbackSummary(
        [FromQuery] int daysBack = 30,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _feedbackService.GetFeedbackSummaryAsync(businessId, daysBack, cancellationToken);

        return Ok(result);
    }

    // ========================================================================
    // AI Form Generation Endpoints (Sprint 38 - Story 1.1)
    // ========================================================================

    /// <summary>
    /// Generates a lead capture form using AI based on industry and purpose.
    /// </summary>
    /// <param name="request">The form generation request with industry, purpose, and preferences.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated form with fields and metadata.</returns>
    /// <remarks>
    /// The AI generates 5-10 fields appropriate for the industry, including BANT-mapped fields
    /// for lead qualification. The response includes an audit ID for feedback tracking.
    /// </remarks>
    [HttpPost("generate/form")]
    [ProducesResponseType(typeof(FormGenerationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<FormGenerationResult>> GenerateForm(
        [FromBody] GenerateFormApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var result = await _formGenerationService.GenerateFormAsync(
            new GenerateFormRequest
            {
                BusinessId = businessId,
                UserId = userId,
                Industry = request.Industry,
                Purpose = request.Purpose,
                DesiredFields = request.DesiredFields,
                Tone = request.Tone,
                IncludeBantFields = request.IncludeBantFields,
                MaxFields = request.MaxFields,
            },
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "Form Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    // ========================================================================
    // AI SMS Template Generation Endpoints (Sprint 39 - Story 2.1)
    // ========================================================================

    /// <summary>
    /// Generates SMS templates using AI based on purpose and context.
    /// </summary>
    /// <param name="request">The template generation request with purpose, tone, and preferences.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated SMS templates with metadata.</returns>
    /// <remarks>
    /// The AI generates multiple template variations (1-5) appropriate for the purpose.
    /// Templates include variable placeholders for personalization.
    /// The response includes an audit ID for feedback tracking.
    /// </remarks>
    [HttpPost("generate/sms-template")]
    [ProducesResponseType(typeof(SmsTemplateGenerationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<SmsTemplateGenerationResult>> GenerateSmsTemplates(
        [FromBody] GenerateSmsTemplateApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId() ?? Guid.Empty;

        var result = await _smsTemplateGenerationService.GenerateSmsTemplatesAsync(
            new GenerateSmsTemplateRequest
            {
                BusinessId = businessId,
                UserId = userId,
                Purpose = request.Purpose,
                Industry = request.Industry,
                Tone = request.Tone,
                Category = request.Category,
                VariationCount = request.VariationCount,
                BusinessContext = request.BusinessContext,
                ExampleTemplates = request.ExampleTemplates,
                IncludeVariables = request.IncludeVariables,
            },
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "SMS Template Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    // ========================================================================
    // AI Report Generation Endpoints (Sprint 42 - Story 6.1)
    // ========================================================================

    /// <summary>
    /// Generates a comprehensive business report using AI.
    /// </summary>
    /// <param name="request">The report generation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated report with insights, charts, and recommendations.</returns>
    /// <remarks>
    /// The AI generates comprehensive reports including:
    /// - Executive summary with key findings
    /// - Key insights with trends and patterns
    /// - Detailed metrics organized by section
    /// - Chart data for visualization
    /// - Actionable recommendations based on analysis.
    ///
    /// Report types available:
    /// - LeadPerformance: Lead qualification and conversion metrics
    /// - ConversionAnalysis: Funnel progression analysis
    /// - ChannelEffectiveness: Channel comparison
    /// - RoiSummary: ROI with cost/revenue metrics
    /// - AiUsageAnalysis: AI feature usage and costs
    /// - TeamPerformance: Team member metrics
    /// - Custom: Custom metrics analysis.
    /// </remarks>
    [HttpPost("generate/report")]
    [ProducesResponseType(typeof(ReportGenerationResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<ReportGenerationResult>> GenerateReport(
        [FromBody] GenerateReportApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var userId = _currentUserService.GetUserId();

        var result = await _reportGenerationService.GenerateReportAsync(
            new ReportGenerationRequest
            {
                BusinessId = businessId,
                UserId = userId,
                ReportType = request.ReportType,
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                Filters = request.Filters,
                CustomMetrics = request.CustomMetrics,
                IncludeTrends = request.IncludeTrends,
                IncludeRecommendations = request.IncludeRecommendations,
            },
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "Report Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    // ========================================================================
    // AI CRM Enrichment Endpoints (Sprint 42 - Story 7.1)
    // ========================================================================

    /// <summary>
    /// Enriches CRM data by analyzing conversation content and extracting
    /// structured information like company name, job title, budget, and timeline.
    /// </summary>
    /// <param name="request">The enrichment request with conversation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Enrichment result with field suggestions and confidence scores.</returns>
    /// <remarks>
    /// Extracts the following types of information:
    /// - Contact details: name, job title, email, phone
    /// - Company information: name, industry, size, location
    /// - Deal signals: budget, timeline, pain points, competitors
    /// - BANT scores: Budget, Authority, Need, Timeline.
    ///
    /// Each suggestion includes:
    /// - Confidence score (0.0-1.0)
    /// - Source quote from conversation
    /// - Reasoning for the extraction
    ///
    /// User should review and accept/reject suggestions before applying.
    /// </remarks>
    [HttpPost("enhance/crm-data")]
    [ProducesResponseType(typeof(CrmEnrichmentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<CrmEnrichmentResult>> EnrichCrmData(
        [FromBody] EnrichCrmDataApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _crmEnrichmentService.EnrichFromConversationAsync(
            new CrmEnrichmentRequest
            {
                BusinessId = businessId,
                ConversationId = request.ConversationId,
                LeadId = request.LeadId,
                ContactId = request.ContactId,
                DealId = request.DealId,
                IncludeCompanyInfo = request.IncludeCompanyInfo,
                IncludeContactDetails = request.IncludeContactDetails,
                IncludeDealSignals = request.IncludeDealSignals,
                IncludeBantScores = request.IncludeBantScores,
            },
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "CRM Enrichment Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Applies accepted enrichment suggestions to CRM entities.
    /// </summary>
    /// <param name="request">The apply enrichment request with accepted suggestions.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Success status.</returns>
    [HttpPost("enhance/crm-data/apply")]
    [ProducesResponseType(typeof(ApplyEnrichmentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApplyEnrichmentResponse>> ApplyEnrichment(
        [FromBody] ApplyEnrichmentApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var success = await _crmEnrichmentService.ApplyEnrichmentAsync(
            businessId,
            request.LeadId,
            request.ContactId,
            request.DealId,
            request.AcceptedSuggestions,
            cancellationToken);

        if (!success)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Apply Enrichment Failed",
                Detail = "Failed to apply enrichment suggestions.",
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(new ApplyEnrichmentResponse { Success = true, Message = "Enrichment applied successfully." });
    }

    // ========================================================================
    // AI Quick Reply Suggestions Endpoints (Sprint 43 - Story 8.1)
    // ========================================================================

    /// <summary>
    /// Generates contextual quick reply suggestions based on conversation context.
    /// Uses gpt-4o-mini for fast response times (&lt;500ms target).
    /// </summary>
    /// <param name="request">The quick reply request with conversation context.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>3-5 quick reply suggestions with confidence scores.</returns>
    /// <remarks>
    /// Returns quick reply suggestions based on:
    /// - The customer's last message
    /// - Recent conversation history
    /// - Detected intent and sentiment
    /// - Business knowledge base content
    ///
    /// Each suggestion includes:
    /// - Suggested reply text
    /// - Confidence score (0-100)
    /// - Category (acknowledgment, answer, question, closing)
    /// - Tone (friendly, professional, empathetic)
    /// - Rationale explaining why this reply is suggested.
    /// </remarks>
    [HttpPost("enhance/quick-replies")]
    [ProducesResponseType(typeof(QuickReplySuggestionResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<QuickReplySuggestionResult>> GetQuickReplySuggestions(
        [FromBody] QuickReplyApiRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _quickReplySuggestionService.GenerateSuggestionsAsync(
            new QuickReplySuggestionRequest
            {
                BusinessId = businessId,
                ConversationId = request.ConversationId,
                LastMessage = request.LastMessage,
                ConversationHistory = request.ConversationHistory,
                DetectedIntent = request.DetectedIntent,
                DetectedSentiment = request.DetectedSentiment,
                SuggestionCount = request.SuggestionCount ?? 5,
            },
            cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "Quick Reply Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    // ========================================================================
    // AI Insights Generation Endpoints (Sprint 40 - Story 3.1)
    // ========================================================================

    /// <summary>
    /// Gets cached dashboard insights for quick display.
    /// Insights are cached for 1 hour per business to reduce costs.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Cached or freshly generated insights.</returns>
    /// <remarks>
    /// Returns AI-generated business insights including:
    /// - Conversion trends and patterns
    /// - Top objections and blockers
    /// - Channel performance comparison
    /// - Anomaly detection (unusual spikes or drops)
    /// - Actionable recommendations.
    /// </remarks>
    [HttpGet("analyze/insights/dashboard")]
    [ProducesResponseType(typeof(InsightsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<InsightsResult>> GetDashboardInsights(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _insightsService.GetDashboardInsightsAsync(businessId, cancellationToken);

        if (!result.Success && result.LimitExceeded)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
            {
                Title = "Usage Limit Exceeded",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status429TooManyRequests,
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Generates custom insights for a specified date range and categories.
    /// This bypasses the cache and generates fresh insights.
    /// </summary>
    /// <param name="request">The insights request with date range and options.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Freshly generated insights.</returns>
    /// <remarks>
    /// Allows customization of:
    /// - Date range for analysis
    /// - Specific insight categories to focus on
    /// - Maximum number of insights to generate
    /// - Whether to include trends and recommendations.
    /// </remarks>
    [HttpPost("analyze/insights")]
    [ProducesResponseType(typeof(InsightsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<InsightsResult>> GenerateCustomInsights(
        [FromBody] InsightsRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _insightsService.GenerateCustomInsightsAsync(businessId, request, cancellationToken);

        if (!result.Success)
        {
            if (result.LimitExceeded)
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
                Title = "Insights Generation Failed",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status400BadRequest,
            });
        }

        return Ok(result);
    }

    /// <summary>
    /// Refreshes the cached dashboard insights for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The refreshed insights.</returns>
    [HttpPost("analyze/insights/refresh")]
    [ProducesResponseType(typeof(InsightsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<InsightsResult>> RefreshDashboardInsights(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();

        var result = await _insightsService.RefreshDashboardInsightsAsync(businessId, cancellationToken);

        if (!result.Success && result.LimitExceeded)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, new ProblemDetails
            {
                Title = "Usage Limit Exceeded",
                Detail = result.ErrorMessage,
                Status = StatusCodes.Status429TooManyRequests,
            });
        }

        return Ok(result);
    }
}

// ============================================================================
// Request/Response DTOs for AI Controller
// ============================================================================

/// <summary>
/// Request for AI response suggestion.
/// </summary>
public record SuggestResponseRequest
{
    /// <summary>Gets the conversation ID to generate a response for.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the optional tone preference (professional, friendly, formal).</summary>
    public string? Tone { get; init; }
}

/// <summary>
/// Request for intent detection.
/// </summary>
public record IntentDetectionRequest
{
    /// <summary>Gets the message to analyze.</summary>
    public required string Message { get; init; }

    /// <summary>Gets the optional previous messages for context.</summary>
    public IEnumerable<string>? ConversationContext { get; init; }
}

/// <summary>
/// Response for intent detection.
/// </summary>
public record IntentDetectionResponse
{
    /// <summary>Gets the primary detected intent.</summary>
    public required string PrimaryIntent { get; init; }

    /// <summary>Gets the confidence score (0.0-1.0).</summary>
    public float Confidence { get; init; }

    /// <summary>Gets the secondary intents detected.</summary>
    public IReadOnlyList<SecondaryIntentDto>? SecondaryIntents { get; init; }

    /// <summary>Gets the entities extracted from the message.</summary>
    public IReadOnlyDictionary<string, string>? ExtractedEntities { get; init; }

    /// <summary>Gets when the intent was detected.</summary>
    public DateTime DetectedAt { get; init; }
}

/// <summary>
/// Secondary intent with confidence.
/// </summary>
public record SecondaryIntentDto
{
    /// <summary>Gets the intent name.</summary>
    public required string Intent { get; init; }

    /// <summary>Gets the confidence score.</summary>
    public float Confidence { get; init; }
}

/// <summary>
/// Request for sentiment analysis.
/// </summary>
public record SentimentAnalysisRequest
{
    /// <summary>Gets the message to analyze.</summary>
    public required string Message { get; init; }
}

/// <summary>
/// Response for sentiment analysis.
/// </summary>
public record SentimentAnalysisResponse
{
    /// <summary>Gets the overall sentiment (Positive, Negative, Neutral, Mixed).</summary>
    public required string Sentiment { get; init; }

    /// <summary>Gets the sentiment score (-1.0 to 1.0).</summary>
    public float Score { get; init; }

    /// <summary>Gets the confidence in the analysis.</summary>
    public float Confidence { get; init; }

    /// <summary>Gets the detected emotions with intensity.</summary>
    public IReadOnlyList<EmotionDto>? Emotions { get; init; }

    /// <summary>Gets when the analysis was performed.</summary>
    public DateTime AnalyzedAt { get; init; }
}

/// <summary>
/// Detected emotion with intensity.
/// </summary>
public record EmotionDto
{
    /// <summary>Gets the emotion name.</summary>
    public required string Emotion { get; init; }

    /// <summary>Gets the intensity (0.0-1.0).</summary>
    public float Intensity { get; init; }
}

/// <summary>
/// Request for AI completion.
/// </summary>
public record AICompletionRequest
{
    /// <summary>Gets the prompt to send to the AI model.</summary>
    public required string Prompt { get; init; }

    /// <summary>Gets the optional system message for context.</summary>
    public string? SystemMessage { get; init; }

    /// <summary>Gets the maximum tokens in response (default: 1000).</summary>
    public int? MaxTokens { get; init; }

    /// <summary>Gets the creativity level 0-1 (default: 0.7).</summary>
    public float? Temperature { get; init; }
}

/// <summary>
/// Response for AI completion.
/// </summary>
public record AICompletionResponse
{
    /// <summary>Gets the generated content.</summary>
    public required string Content { get; init; }

    /// <summary>Gets when the content was generated.</summary>
    public DateTime GeneratedAt { get; init; }

    /// <summary>Gets the API latency in milliseconds.</summary>
    public double LatencyMs { get; init; }
}

/// <summary>
/// API request to record feedback on AI generation.
/// </summary>
public record RecordFeedbackApiRequest
{
    /// <summary>Gets the AI generation audit ID.</summary>
    public required Guid AuditId { get; init; }

    /// <summary>Gets the feedback type (Accepted, Modified, Rejected, ThumbsUp, ThumbsDown).</summary>
    public required string FeedbackType { get; init; }

    /// <summary>Gets an optional comment explaining the feedback.</summary>
    public string? Comment { get; init; }
}

/// <summary>
/// Response after recording feedback.
/// </summary>
public record RecordFeedbackResponse
{
    /// <summary>Gets a value indicating whether the feedback was recorded successfully.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets a message describing the result.</summary>
    public string? Message { get; init; }
}

/// <summary>
/// API request to generate a form using AI.
/// </summary>
public record GenerateFormApiRequest
{
    /// <summary>Gets the industry/vertical (e.g., "Real Estate", "Healthcare", "SaaS").</summary>
    public required string Industry { get; init; }

    /// <summary>Gets the purpose of the form (e.g., "Lead capture", "Demo request", "Contact us").</summary>
    public required string Purpose { get; init; }

    /// <summary>Gets optional desired fields to include.</summary>
    public IReadOnlyList<string>? DesiredFields { get; init; }

    /// <summary>Gets optional tone/style preferences (e.g., "Professional", "Casual", "Friendly").</summary>
    public string? Tone { get; init; }

    /// <summary>Gets a value indicating whether to include BANT qualification fields (default: true).</summary>
    public bool IncludeBantFields { get; init; } = true;

    /// <summary>Gets the maximum number of fields to generate (default: 8).</summary>
    public int MaxFields { get; init; } = 8;
}

/// <summary>
/// API request to generate SMS templates using AI.
/// </summary>
public record GenerateSmsTemplateApiRequest
{
    /// <summary>Gets the purpose or use case for the templates (e.g., "appointment reminders", "follow-up messages").</summary>
    public required string Purpose { get; init; }

    /// <summary>Gets the industry context for tailored messaging.</summary>
    public string? Industry { get; init; }

    /// <summary>Gets the desired tone (Professional, Friendly, Casual).</summary>
    public string Tone { get; init; } = "Professional";

    /// <summary>Gets the category for the generated templates.</summary>
    public string Category { get; init; } = "General";

    /// <summary>Gets the number of template variations to generate (1-5).</summary>
    public int VariationCount { get; init; } = 3;

    /// <summary>Gets optional context about the business or product.</summary>
    public string? BusinessContext { get; init; }

    /// <summary>Gets optional example templates to use as reference.</summary>
    public IReadOnlyList<string>? ExampleTemplates { get; init; }

    /// <summary>Gets a value indicating whether to include variable placeholders like {{name}}, {{date}}.</summary>
    public bool IncludeVariables { get; init; } = true;
}

/// <summary>
/// API request to generate a business report using AI.
/// </summary>
public record GenerateReportApiRequest
{
    /// <summary>Gets the type of report to generate.</summary>
    public required ReportType ReportType { get; init; }

    /// <summary>Gets the start date for the report period.</summary>
    public required DateTime DateFrom { get; init; }

    /// <summary>Gets the end date for the report period.</summary>
    public required DateTime DateTo { get; init; }

    /// <summary>Gets optional filters for the report (e.g., channel, status).</summary>
    public IReadOnlyDictionary<string, string>? Filters { get; init; }

    /// <summary>Gets optional custom metrics to include in the report.</summary>
    public IReadOnlyList<string>? CustomMetrics { get; init; }

    /// <summary>Gets a value indicating whether to include trend analysis (default: true).</summary>
    public bool IncludeTrends { get; init; } = true;

    /// <summary>Gets a value indicating whether to include AI-generated recommendations (default: true).</summary>
    public bool IncludeRecommendations { get; init; } = true;
}

/// <summary>
/// API request to enrich CRM data using AI.
/// </summary>
public record EnrichCrmDataApiRequest
{
    /// <summary>Gets the conversation ID to analyze.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the optional lead ID to enrich.</summary>
    public Guid? LeadId { get; init; }

    /// <summary>Gets the optional contact ID to enrich.</summary>
    public Guid? ContactId { get; init; }

    /// <summary>Gets the optional deal ID to enrich.</summary>
    public Guid? DealId { get; init; }

    /// <summary>Gets a value indicating whether to include company enrichment (default: true).</summary>
    public bool IncludeCompanyInfo { get; init; } = true;

    /// <summary>Gets a value indicating whether to include contact details enrichment (default: true).</summary>
    public bool IncludeContactDetails { get; init; } = true;

    /// <summary>Gets a value indicating whether to include deal signals enrichment (default: true).</summary>
    public bool IncludeDealSignals { get; init; } = true;

    /// <summary>Gets a value indicating whether to include BANT scoring (default: true).</summary>
    public bool IncludeBantScores { get; init; } = true;
}

/// <summary>
/// API request to apply accepted enrichment suggestions.
/// </summary>
public record ApplyEnrichmentApiRequest
{
    /// <summary>Gets the optional lead ID to update.</summary>
    public Guid? LeadId { get; init; }

    /// <summary>Gets the optional contact ID to update.</summary>
    public Guid? ContactId { get; init; }

    /// <summary>Gets the optional deal ID to update.</summary>
    public Guid? DealId { get; init; }

    /// <summary>Gets the accepted field suggestions to apply.</summary>
    public required IReadOnlyList<CrmFieldSuggestion> AcceptedSuggestions { get; init; }
}

/// <summary>
/// Response after applying enrichment.
/// </summary>
public record ApplyEnrichmentResponse
{
    /// <summary>Gets a value indicating whether the enrichment was applied successfully.</summary>
    public required bool Success { get; init; }

    /// <summary>Gets a message describing the result.</summary>
    public string? Message { get; init; }
}

/// <summary>
/// API request for AI quick reply suggestions.
/// </summary>
public record QuickReplyApiRequest
{
    /// <summary>Gets the conversation ID for context.</summary>
    public required Guid ConversationId { get; init; }

    /// <summary>Gets the last message from the customer.</summary>
    public required string LastMessage { get; init; }

    /// <summary>Gets optional recent conversation history for context.</summary>
    public IReadOnlyList<string>? ConversationHistory { get; init; }

    /// <summary>Gets the detected intent of the last message (if available).</summary>
    public string? DetectedIntent { get; init; }

    /// <summary>Gets the detected sentiment (if available).</summary>
    public string? DetectedSentiment { get; init; }

    /// <summary>Gets the number of suggestions to generate (default: 5, max: 10).</summary>
    public int? SuggestionCount { get; init; }
}
