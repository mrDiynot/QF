// <copyright file="AiResponseTemplatesController.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QualiFlow.API.Attributes;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.AI.DTOs;
using QualiFlow.Application.Features.AI.Services;
using QualiFlow.Application.Features.Authorization;

namespace QualiFlow.API.Controllers;

/// <summary>
/// Controller for managing AI response templates.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/ai-response-templates")]
[Authorize(Policy = BusinessPolicies.RequireBusinessUser)]
[Produces("application/json")]
public class AiResponseTemplatesController : ControllerBase
{
    private readonly IAiResponseTemplateService _templateService;
    private readonly ICurrentUserService _currentUserService;

    /// <summary>
    /// Initializes a new instance of the <see cref="AiResponseTemplatesController"/> class.
    /// </summary>
    public AiResponseTemplatesController(
        IAiResponseTemplateService templateService,
        ICurrentUserService currentUserService)
    {
        _templateService = templateService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Gets all AI response templates for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of templates.</returns>
    [HttpGet]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<AiResponseTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AiResponseTemplateDto>>> GetAllAsync(
        [FromQuery] string? category = null,
        [FromQuery] bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var templates = await _templateService.GetAllAsync(businessId, category, isActive, cancellationToken);
        return Ok(templates);
    }

    /// <summary>
    /// Gets available template categories.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of category names.</returns>
    [HttpGet("categories")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(IEnumerable<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<string>>> GetCategoriesAsync(
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var categories = await _templateService.GetCategoriesAsync(businessId, cancellationToken);
        return Ok(categories);
    }

    /// <summary>
    /// Gets a specific AI response template by ID.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Template details.</returns>
    [HttpGet("{id:guid}")]
    [CacheControl(CacheStrategies.ShortTerm, "Authorization")]
    [ProducesResponseType(typeof(AiResponseTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AiResponseTemplateDto>> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var template = await _templateService.GetByIdAsync(businessId, id, cancellationToken);

        if (template == null)
        {
            return NotFound();
        }

        return Ok(template);
    }

    /// <summary>
    /// Creates a new AI response template.
    /// </summary>
    /// <param name="request">Template creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created template.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AiResponseTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AiResponseTemplateDto>> CreateAsync(
        [FromBody] CreateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var template = await _templateService.CreateAsync(businessId, request, cancellationToken);
        return CreatedAtAction(nameof(GetByIdAsync), new { id = template.Id }, template);
    }

    /// <summary>
    /// Updates an existing AI response template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="request">Template update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated template.</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AiResponseTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AiResponseTemplateDto>> UpdateAsync(
        Guid id,
        [FromBody] UpdateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var template = await _templateService.UpdateAsync(businessId, id, request, cancellationToken);

        if (template == null)
        {
            return NotFound();
        }

        return Ok(template);
    }

    /// <summary>
    /// Deletes an AI response template (soft delete).
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content on success.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();
        var deleted = await _templateService.DeleteAsync(businessId, id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    /// <summary>
    /// Generates an AI response using a template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="variables">Variables to replace in the template prompt.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Generated response.</returns>
    [HttpPost("{id:guid}/generate")]
    [ProducesResponseType(typeof(GenerateFromTemplateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GenerateFromTemplateResponse>> GenerateAsync(
        Guid id,
        [FromBody] IDictionary<string, string> variables,
        CancellationToken cancellationToken = default)
    {
        var businessId = _currentUserService.GetBusinessId();

        try
        {
            var response = await _templateService.GenerateFromTemplateAsync(
                businessId, id, variables, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }
}
