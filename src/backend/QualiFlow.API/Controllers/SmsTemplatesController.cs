// -----------------------------------------------------------------------
// <copyright file="SmsTemplatesController.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Features.SmsTemplates.DTOs;
using QualiFlow.Application.Features.SmsTemplates.Services;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for SMS template operations.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/sms-templates")]
[Authorize]
[Produces("application/json")]
public class SmsTemplatesController : ControllerBase
{
    private readonly ISmsTemplateService _smsTemplateService;

    /// <summary>
    /// Initializes a new instance of the <see cref="SmsTemplatesController"/> class.
    /// </summary>
    /// <param name="smsTemplateService">The SMS template service.</param>
    public SmsTemplatesController(ISmsTemplateService smsTemplateService)
    {
        _smsTemplateService = smsTemplateService;
    }

    /// <summary>
    /// Gets all SMS templates for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="search">Optional search query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of SMS templates.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IReadOnlyList<SmsTemplateResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SmsTemplateResponse>>> GetAllAsync(
        [FromQuery] string? category,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var templates = await _smsTemplateService.GetAllAsync(category, search, cancellationToken);
        return Ok(templates);
    }

    /// <summary>
    /// Gets an SMS template by ID.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The template if found.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(SmsTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmsTemplateResponse>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var template = await _smsTemplateService.GetByIdAsync(id, cancellationToken);
        if (template == null)
        {
            return NotFound();
        }

        return Ok(template);
    }

    /// <summary>
    /// Creates a new SMS template.
    /// </summary>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created template.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SmsTemplateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SmsTemplateResponse>> CreateAsync(
        [FromBody] CreateSmsTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var template = await _smsTemplateService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByIdAsync), new { id = template.Id }, template);
    }

    /// <summary>
    /// Updates an existing SMS template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated template.</returns>
    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(SmsTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmsTemplateResponse>> UpdateAsync(
        Guid id,
        [FromBody] UpdateSmsTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var template = await _smsTemplateService.UpdateAsync(id, request, cancellationToken);
        if (template == null)
        {
            return NotFound();
        }

        return Ok(template);
    }

    /// <summary>
    /// Deletes an SMS template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content if successful.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _smsTemplateService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Increments the usage count of a template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated template.</returns>
    [HttpPost("{id:guid}/use")]
    [ProducesResponseType(typeof(SmsTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SmsTemplateResponse>> UseTemplateAsync(Guid id, CancellationToken cancellationToken)
    {
        var template = await _smsTemplateService.IncrementUsageAsync(id, cancellationToken);
        if (template == null)
        {
            return NotFound();
        }

        return Ok(template);
    }
}
