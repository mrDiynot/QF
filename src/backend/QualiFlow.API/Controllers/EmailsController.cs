using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data.Repositories;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for email operations including sending emails and managing templates.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
[Produces("application/json")]
public class EmailsController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateRepository _templateRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<EmailsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="EmailsController"/> class.
    /// </summary>
    /// <param name="emailService">The email service.</param>
    /// <param name="templateRepository">The email template repository.</param>
    /// <param name="currentUser">The current user service.</param>
    /// <param name="logger">The logger.</param>
    public EmailsController(
        IEmailService emailService,
        IEmailTemplateRepository templateRepository,
        ICurrentUserService currentUser,
        ILogger<EmailsController> logger)
    {
        _emailService = emailService;
        _templateRepository = templateRepository;
        _currentUser = currentUser;
        _logger = logger;
    }

    /// <summary>
    /// Sends a single email.
    /// </summary>
    /// <param name="request">The email request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email status response.</returns>
    [HttpPost("send")]
    [ProducesResponseType(typeof(EmailStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<EmailStatusResponse>> SendEmail(
        [FromBody] SendEmailRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sending email to {ToEmail} from business {BusinessId}",
            request.ToEmail,
            _currentUser.GetBusinessId());

        var result = await _emailService.SendEmailAsync(request, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Sends an email using a template.
    /// </summary>
    /// <param name="templateId">The template ID.</param>
    /// <param name="toEmail">The recipient email address.</param>
    /// <param name="variables">The template variables.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email status response.</returns>
    [HttpPost("send-template")]
    [ProducesResponseType(typeof(EmailStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
#pragma warning disable MA0016 // Prefer using collection abstraction instead of implementation - Dictionary required for JSON deserialization
    public async Task<ActionResult<EmailStatusResponse>> SendTemplateEmail(
        [FromQuery] Guid templateId,
        [FromQuery] string toEmail,
        [FromBody] Dictionary<string, string> variables,
        CancellationToken cancellationToken)
#pragma warning restore MA0016
    {
        _logger.LogInformation(
            "Sending template email {TemplateId} to {ToEmail} from business {BusinessId}",
            templateId,
            toEmail,
            _currentUser.GetBusinessId());

        var result = await _emailService.SendTemplateEmailAsync(
            templateId,
            toEmail,
            toName: null,
            variables,
            cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Sends bulk emails to multiple recipients.
    /// </summary>
    /// <param name="request">The bulk email request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of email status responses.</returns>
    [HttpPost("send-bulk")]
    [ProducesResponseType(typeof(List<EmailStatusResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<EmailStatusResponse>>> SendBulkEmail(
        [FromBody] SendBulkEmailRequest request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Sending bulk email to {RecipientCount} recipients from business {BusinessId}",
            request.Recipients.Count,
            _currentUser.GetBusinessId());

        var results = await _emailService.SendBulkEmailAsync(request, cancellationToken);
        return Ok(results);
    }

    /// <summary>
    /// Gets the status of an email by Resend email ID.
    /// </summary>
    /// <param name="resendEmailId">The Resend email ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The email status response.</returns>
    [HttpGet("{resendEmailId}/status")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(EmailStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<EmailStatusResponse>> GetEmailStatus(
        string resendEmailId,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Getting email status for {ResendEmailId} from business {BusinessId}",
            resendEmailId,
            _currentUser.GetBusinessId());

        var result = await _emailService.GetEmailStatusAsync(resendEmailId, cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Gets all email templates for the current business.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of email templates.</returns>
    [HttpGet("templates")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(List<EmailTemplate>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<EmailTemplate>>> GetTemplates(
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        _logger.LogInformation("Getting email templates for business {BusinessId}", businessId);

        var templates = await _templateRepository.GetAllAsync(businessId, cancellationToken: cancellationToken);
        return Ok(templates);
    }

    /// <summary>
    /// Creates a new email template.
    /// </summary>
    /// <param name="template">The email template to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created email template.</returns>
    [HttpPost("templates")]
    [ProducesResponseType(typeof(EmailTemplate), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<EmailTemplate>> CreateTemplate(
        [FromBody] EmailTemplate template,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        template.BusinessId = businessId;

        _logger.LogInformation(
            "Creating email template {TemplateName} for business {BusinessId}",
            template.Name,
            businessId);

        var createdTemplate = await _templateRepository.CreateAsync(template, cancellationToken);
        return CreatedAtAction(nameof(GetTemplates), new { id = createdTemplate.Id }, createdTemplate);
    }

    /// <summary>
    /// Updates an existing email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="template">The updated template data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpPut("templates/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTemplate(
        Guid id,
        [FromBody] EmailTemplate template,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var existingTemplate = await _templateRepository.GetByIdAsync(id, cancellationToken);

        if (existingTemplate == null || existingTemplate.BusinessId != businessId)
        {
            return NotFound();
        }

        template.Id = id;
        template.BusinessId = businessId;

        _logger.LogInformation(
            "Updating email template {TemplateId} for business {BusinessId}",
            id,
            businessId);

        await _templateRepository.UpdateAsync(template, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Deletes an email template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("templates/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(
        Guid id,
        CancellationToken cancellationToken)
    {
        var businessId = _currentUser.GetBusinessId();
        var template = await _templateRepository.GetByIdAsync(id, cancellationToken);

        if (template == null || template.BusinessId != businessId)
        {
            return NotFound();
        }

        _logger.LogInformation(
            "Deleting email template {TemplateId} for business {BusinessId}",
            id,
            businessId);

        await _templateRepository.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

