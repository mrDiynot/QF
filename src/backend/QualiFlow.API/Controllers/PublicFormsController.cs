using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.Interfaces;
using QualiFlow.Application.Features.Forms.DTOs;
using QualiFlow.Application.Features.Forms.Services;
using QualiFlow.Application.Features.InboundMessages.Services;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Public API controller for anonymous form submissions.
/// These endpoints are accessible without authentication for lead capture.
/// </summary>
/// <remarks>
/// This controller provides:
/// - Public form retrieval by slug (for rendering forms on external websites).
/// - Anonymous form submission (creates leads and triggers AI qualification).
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/public/forms")]
[AllowAnonymous]
[ApiExplorerSettings(GroupName = "v1")]
public partial class PublicFormsController : ControllerBase
{
    private readonly IFormRepository _formRepository;
    private readonly IFormService _formService;
    private readonly IFormQualificationService _formQualificationService;
    private readonly IBackgroundJobService _backgroundJobService;
    private readonly ILogger<PublicFormsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublicFormsController"/> class.
    /// </summary>
    /// <param name="formRepository">The form repository.</param>
    /// <param name="formService">The form service.</param>
    /// <param name="formQualificationService">The form qualification service for BANT scoring.</param>
    /// <param name="backgroundJobService">The background job service.</param>
    /// <param name="logger">The logger.</param>
    public PublicFormsController(
        IFormRepository formRepository,
        IFormService formService,
        IFormQualificationService formQualificationService,
        IBackgroundJobService backgroundJobService,
        ILogger<PublicFormsController> logger)
    {
        _formRepository = formRepository;
        _formService = formService;
        _formQualificationService = formQualificationService;
        _backgroundJobService = backgroundJobService;
        _logger = logger;
    }

    /// <summary>
    /// Gets a published form by its slug for public display.
    /// </summary>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The form definition for rendering.</returns>
    /// <response code="200">Returns the form definition.</response>
    /// <response code="404">Form not found or not published.</response>
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(PublicFormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicFormResponse>> GetFormBySlugAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        LogGettingPublicForm(_logger, slug);

        var form = await _formRepository.GetPublicFormBySlugAsync(slug, cancellationToken);
        if (form == null)
        {
            LogFormNotFound(_logger, slug);
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Form not found",
                Detail = $"No published form found with slug: {slug}",
            });
        }

        var response = new PublicFormResponse
        {
            Id = form.Id,
            Name = form.Name,
            Description = form.Description,
            Fields = form.Fields,
            Styling = form.Styling,
            ThankYouMessage = form.ThankYouMessage,
            RedirectUrl = form.RedirectUrl?.ToString(),
        };

        return Ok(response);
    }

    /// <summary>
    /// Submits a form anonymously (creates a lead).
    /// </summary>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="request">The form submission data.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Submission confirmation.</returns>
    /// <response code="201">Form submitted successfully.</response>
    /// <response code="400">Validation failed.</response>
    /// <response code="404">Form not found or not published.</response>
    [HttpPost("{slug}/submit")]
    [ProducesResponseType(typeof(PublicFormSubmissionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PublicFormSubmissionResponse>> SubmitFormAsync(
        string slug,
        [FromBody] PublicFormSubmissionRequest request,
        CancellationToken cancellationToken)
    {
        LogSubmittingForm(_logger, slug);

        var form = await _formRepository.GetPublicFormBySlugAsync(slug, cancellationToken);
        if (form == null)
        {
            LogFormNotFound(_logger, slug);
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Form not found",
                Detail = $"No published form found with slug: {slug}",
            });
        }

        try
        {
            // Parse referrer URL if present
            Uri? referrerUrl = null;
            var referrerHeader = Request.Headers.Referer.ToString();
            if (!string.IsNullOrEmpty(referrerHeader) &&
                Uri.TryCreate(referrerHeader, UriKind.Absolute, out var parsedUri))
            {
                referrerUrl = parsedUri;
            }

            // Create submission request with metadata
            var submissionRequest = new CreateFormSubmissionRequest
            {
                SubmittedData = request.Data,
                IpAddress = GetClientIpAddress(),
                UserAgent = Request.Headers.UserAgent.ToString(),
                ReferrerUrl = referrerUrl,
            };

            var submission = await _formService.CreateSubmissionAsync(
                form.BusinessId, form.Id, submissionRequest, cancellationToken);

            // Sprint 37: Immediate BANT qualification from form fields (rule-based)
            // This provides instant scoring without waiting for AI background job
            if (submission.LeadId.HasValue)
            {
                try
                {
                    var qualificationResult = await _formQualificationService.QualifyFromSubmissionDataAsync(
                        form.BusinessId,
                        submission.Id,
                        submission.LeadId.Value,
                        submission.SubmittedData,
                        form.Fields,
                        cancellationToken);

                    LogFormQualificationResult(
                        _logger, submission.Id, qualificationResult.OverallScore, qualificationResult.IsQualified);
                }
                catch (Exception ex)
                {
                    // Don't fail the submission if qualification fails - it will be retried in background
                    LogFormQualificationError(_logger, submission.Id, ex.Message);
                }

                // Enqueue AI qualification job for deeper analysis
                // Note: We pass the submission ID as the trigger ID for tracing
                _backgroundJobService.Enqueue<IAiQualificationJobService>(
                    service => service.ProcessAiQualificationAsync(
                        form.BusinessId, submission.LeadId.Value, submission.Id));

                // Enqueue AI auto-response job for form submissions (unified orchestration)
                // This enables AI to follow up with leads who submitted forms
                _backgroundJobService.Enqueue<IAIAutoResponseJobService>(
                    service => service.ProcessAiAutoResponseAsync(
                        form.BusinessId, submission.LeadId.Value, submission.Id, "Form"));
            }

            LogFormSubmitted(_logger, slug, submission.Id);

            var locationUri = new Uri(
                $"/api/v1/public/forms/{slug}/submissions/{submission.Id}",
                UriKind.Relative);

            return Created(
                locationUri,
                new PublicFormSubmissionResponse
                {
                    Success = true,
                    SubmissionId = submission.Id,
                    ThankYouMessage = form.ThankYouMessage,
                    RedirectUrl = form.RedirectUrl?.ToString(),
                });
        }
        catch (InvalidOperationException ex)
        {
            LogSubmissionFailed(_logger, slug, ex.Message);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Submission failed",
                Detail = ex.Message,
            });
        }
    }

    private string GetClientIpAddress()
    {
        // Check for forwarded IP (behind proxy/load balancer)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    // Logging methods

    [LoggerMessage(Level = LogLevel.Information, Message = "Getting public form by slug: {Slug}")]
    private static partial void LogGettingPublicForm(ILogger logger, string slug);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Public form not found: {Slug}")]
    private static partial void LogFormNotFound(ILogger logger, string slug);

    [LoggerMessage(Level = LogLevel.Information, Message = "Submitting form: {Slug}")]
    private static partial void LogSubmittingForm(ILogger logger, string slug);

    [LoggerMessage(Level = LogLevel.Information, Message = "Form submitted: {Slug}, SubmissionId: {SubmissionId}")]
    private static partial void LogFormSubmitted(ILogger logger, string slug, Guid submissionId);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Form submission failed: {Slug}, Error: {Error}")]
    private static partial void LogSubmissionFailed(ILogger logger, string slug, string error);

    [LoggerMessage(Level = LogLevel.Information, Message = "Form qualification result for {SubmissionId}: Score={Score}, IsQualified={IsQualified}")]
    private static partial void LogFormQualificationResult(ILogger logger, Guid submissionId, int score, bool isQualified);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Form qualification error for {SubmissionId}: {Error}")]
    private static partial void LogFormQualificationError(ILogger logger, Guid submissionId, string error);
}

