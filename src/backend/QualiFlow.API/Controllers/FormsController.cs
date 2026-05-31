using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Authorization;
using QualiFlow.Application.Features.Forms.DTOs;
using QualiFlow.Application.Features.Forms.Services;
using QualiFlow.Domain.Enums;

namespace QualiFlow.API.Controllers;

/// <summary>
/// API controller for form management operations.
/// Provides RESTful endpoints for creating, reading, updating, and deleting forms.
/// All operations are scoped to the authenticated user's business (tenant) for multi-tenancy isolation.
/// </summary>
/// <remarks>
/// This controller implements the following business rules:
/// - Multi-tenancy: All operations are automatically filtered by the current user's business ID.
/// - Form status transitions: Draft → Published → Archived.
/// - Slug uniqueness: Form slugs must be unique within a business (tenant).
/// - Form submissions: Only published and active forms can accept submissions.
/// - Role requirement: Manager, Admin, or Owner role required (forms are lead capture tools).
/// </remarks>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = "Bearer", Policy = BusinessPolicies.RequireManagerOrHigher)]
public class FormsController : ControllerBase
{
    private readonly IFormService _formService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="FormsController"/> class.
    /// </summary>
    /// <param name="formService">The form service.</param>
    /// <param name="currentUserService">The current user service.</param>
    public FormsController(
        IFormService formService,
        ICurrentUserService currentUserService)
    {
        _formService = formService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets a paginated list of forms for the current business.
    /// </summary>
    /// <param name="page">The page number (1-based). Default is 1.</param>
    /// <param name="pageSize">The number of items per page. Default is 10.</param>
    /// <param name="status">Optional filter by form status.</param>
    /// <param name="isActive">Optional filter by active status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of forms.</returns>
    /// <response code="200">Returns the paginated list of forms.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(PagedFormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedFormResponse>> GetFormsAsync(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] FormStatus? status = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var result = await _formService.GetFormsAsync(
            businessId, page, pageSize, status, isActive, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets a form by ID.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found.</returns>
    /// <response code="200">Returns the form.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("{id}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> GetFormAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.GetFormByIdAsync(businessId, id, cancellationToken);

        if (form == null)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        return Ok(form);
    }

    /// <summary>
    /// Gets a form by its unique slug.
    /// </summary>
    /// <param name="slug">The form's unique slug.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The form if found.</returns>
    /// <response code="200">Returns the form.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("by-slug/{slug}")]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> GetFormBySlugAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.GetFormBySlugAsync(businessId, slug, cancellationToken);

        if (form == null)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Form not found",
                Detail = $"Form with slug '{slug}' was not found.",
            });
        }

        return Ok(form);
    }

    /// <summary>
    /// Creates a new form.
    /// </summary>
    /// <param name="request">The form creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created form.</returns>
    /// <response code="201">Form created successfully.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> CreateFormAsync(
        [FromBody] CreateFormRequest request,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.CreateFormAsync(businessId, request, cancellationToken);

        // Use Created with explicit URL to avoid API versioning routing issues
        var locationUri = new Uri($"/api/v1/Forms/{form.Id}", UriKind.Relative);
        return Created(locationUri, form);
    }

    /// <summary>
    /// Updates an existing form.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="request">The form update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated form.</returns>
    /// <response code="200">Form updated successfully.</response>
    /// <response code="400">Invalid request data or business rule violation.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPatch("{id}")]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> UpdateFormAsync(
        Guid id,
        [FromBody] UpdateFormRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var form = await _formService.UpdateFormAsync(businessId, id, request, cancellationToken);

            if (form == null)
            {
                return NotFound(CreateNotFoundProblem(id));
            }

            return Ok(form);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Business rule violation",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Deletes a form.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <response code="204">Form deleted successfully.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteFormAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var deleted = await _formService.DeleteFormAsync(businessId, id, cancellationToken);

        if (!deleted)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        return NoContent();
    }

    /// <summary>
    /// Publishes a form, making it active and accepting submissions.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The published form.</returns>
    /// <response code="200">Form published successfully.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/publish")]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> PublishFormAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.PublishFormAsync(businessId, id, cancellationToken);

        if (form == null)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        return Ok(form);
    }

    /// <summary>
    /// Archives a form, making it inactive and no longer accepting submissions.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The archived form.</returns>
    /// <response code="200">Form archived successfully.</response>
    /// <response code="404">Form not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/archive")]
    [ProducesResponseType(typeof(FormResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormResponse>> ArchiveFormAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.ArchiveFormAsync(businessId, id, cancellationToken);

        if (form == null)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        return Ok(form);
    }

    /// <summary>
    /// Gets a paginated list of submissions for a form.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="page">The page number (1-based). Default is 1.</param>
    /// <param name="pageSize">The number of items per page. Default is 10.</param>
    /// <param name="isProcessed">Optional filter by processed status.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of form submissions.</returns>
    /// <response code="200">Returns the paginated list of submissions.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpGet("{id}/submissions")]
    [ProducesResponseType(typeof(PagedFormSubmissionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedFormSubmissionResponse>> GetFormSubmissionsAsync(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isProcessed = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var result = await _formService.GetFormSubmissionsAsync(
            businessId, id, page, pageSize, isProcessed, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new form submission.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="request">The submission request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created submission.</returns>
    /// <response code="201">Submission created successfully.</response>
    /// <response code="400">Invalid request or form not accepting submissions.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/submissions")]
    [ProducesResponseType(typeof(FormSubmissionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<FormSubmissionResponse>> CreateSubmissionAsync(
        Guid id,
        [FromBody] CreateFormSubmissionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var businessId = _currentUserService.GetBusinessId();
            var submission = await _formService.CreateSubmissionAsync(
                businessId, id, request, cancellationToken);

            // Use Created with explicit URL to avoid API versioning routing issues
            var locationUri = new Uri($"/api/v1/Forms/{id}/submissions", UriKind.Relative);
            return Created(locationUri, submission);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Submission failed",
                Detail = ex.Message,
            });
        }
    }

    /// <summary>
    /// Marks a form submission as processed.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="submissionId">The submission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    /// <response code="204">Submission marked as processed.</response>
    /// <response code="404">Submission not found.</response>
    /// <response code="401">User is not authenticated.</response>
    [HttpPost("{id}/submissions/{submissionId}/process")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> MarkSubmissionAsProcessedAsync(
        Guid id,
        Guid submissionId,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUserService.GetBusinessId();
        var processed = await _formService.MarkSubmissionAsProcessedAsync(
            businessId, submissionId, cancellationToken);

        if (!processed)
        {
            return NotFound(new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Submission not found",
                Detail = $"Submission with ID {submissionId} was not found.",
            });
        }

        return NoContent();
    }

    /// <summary>
    /// Generates a QR code for a form.
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="size">QR code size in pixels. Default is 256.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A PNG image of the QR code.</returns>
    /// <response code="200">Returns the QR code image.</response>
    /// <response code="404">Form not found.</response>
    [HttpGet("{id}/qr-code")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQrCodeAsync(
        Guid id,
        [FromQuery] int size = 256,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.GetFormByIdAsync(businessId, id, cancellationToken);

        if (form == null)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        // Generate form URL
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var formUrl = $"{baseUrl}/forms/submit/{form.Slug}";

        // Generate QR code using simple SVG (no external library needed)
        var qrCodeSvg = GenerateQrCodeSvg(formUrl, size);

        return Content(qrCodeSvg, "image/svg+xml");
    }

    /// <summary>
    /// Gets the QR code data URL for a form (base64 encoded).
    /// </summary>
    /// <param name="id">The form ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The QR code data URL and form URL.</returns>
    [HttpGet("{id}/qr-code-data")]
    [ProducesResponseType(typeof(QrCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<QrCodeResponse>> GetQrCodeDataAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var form = await _formService.GetFormByIdAsync(businessId, id, cancellationToken);

        if (form == null)
        {
            return NotFound(CreateNotFoundProblem(id));
        }

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var formUrl = $"{baseUrl}/forms/submit/{form.Slug}";

        return Ok(new QrCodeResponse
        {
            FormId = id,
            FormUrl = formUrl,
            QrCodeUrl = $"/api/v1/forms/{id}/qr-code",
        });
    }

    private static string GenerateQrCodeSvg(string data, int size)
    {
        // Simple placeholder SVG that represents a QR code
        // In production, use a proper QR code library like QRCoder
        var encodedData = Uri.EscapeDataString(data);

        // Using Google Charts API URL for QR code generation
        // This returns an SVG with an embedded image from Google Charts
        return $@"<svg xmlns=""http://www.w3.org/2000/svg"" width=""{size}"" height=""{size}"" viewBox=""0 0 {size} {size}"">
  <rect width=""100%"" height=""100%"" fill=""white""/>
  <image href=""https://chart.googleapis.com/chart?cht=qr&amp;chs={size}x{size}&amp;chl={encodedData}&amp;choe=UTF-8"" width=""{size}"" height=""{size}""/>
</svg>";
    }

    private static ProblemDetails CreateNotFoundProblem(Guid id)
    {
        return new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Form not found",
            Detail = $"Form with ID {id} was not found or does not belong to your business.",
        };
    }
}

/// <summary>
/// Response containing QR code data for a form.
/// </summary>
public record QrCodeResponse
{
    /// <summary>
    /// Gets the form ID.
    /// </summary>
    public Guid FormId { get; init; }

    /// <summary>
    /// Gets the public URL for the form.
    /// </summary>
#pragma warning disable CA1056
    public string FormUrl { get; init; } = string.Empty;
#pragma warning restore CA1056

    /// <summary>
    /// Gets the URL to fetch the QR code image.
    /// </summary>
#pragma warning disable CA1056
    public string QrCodeUrl { get; init; } = string.Empty;
#pragma warning restore CA1056
}
