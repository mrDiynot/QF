// <copyright file="IAiResponseTemplateService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Services;

/// <summary>
/// Service for managing AI response templates.
/// </summary>
public interface IAiResponseTemplateService
{
    /// <summary>
    /// Gets all templates for a business.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of templates matching the criteria.</returns>
    Task<IReadOnlyList<AiResponseTemplateDto>> GetAllAsync(
        Guid businessId,
        string? category = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a template by ID.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="templateId">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The template if found, null otherwise.</returns>
    Task<AiResponseTemplateDto?> GetByIdAsync(
        Guid businessId,
        Guid templateId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new template.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="request">The template creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created template.</returns>
    Task<AiResponseTemplateDto> CreateAsync(
        Guid businessId,
        CreateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing template.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="templateId">The template ID.</param>
    /// <param name="request">The template update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated template if found, null otherwise.</returns>
    Task<AiResponseTemplateDto?> UpdateAsync(
        Guid businessId,
        Guid templateId,
        UpdateAiResponseTemplateRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a template (soft delete).
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="templateId">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteAsync(
        Guid businessId,
        Guid templateId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates AI response using a template.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="templateId">The template ID.</param>
    /// <param name="variables">Variables to replace in the template prompt.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated response.</returns>
    Task<GenerateFromTemplateResponse> GenerateFromTemplateAsync(
        Guid businessId,
        Guid templateId,
        IDictionary<string, string> variables,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets available template categories.
    /// </summary>
    /// <param name="businessId">The business ID (tenant).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of unique category names.</returns>
    Task<IReadOnlyList<string>> GetCategoriesAsync(
        Guid businessId,
        CancellationToken cancellationToken = default);
}
