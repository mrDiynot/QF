// -----------------------------------------------------------------------
// <copyright file="ISmsTemplateService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.SmsTemplates.DTOs;

namespace QualiFlow.Application.Features.SmsTemplates.Services;

/// <summary>
/// Service interface for SMS template operations.
/// </summary>
public interface ISmsTemplateService
{
    /// <summary>
    /// Gets all SMS templates for the current business.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="search">Optional search query.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of SMS templates.</returns>
    Task<IReadOnlyList<SmsTemplateResponse>> GetAllAsync(string? category, string? search, CancellationToken cancellationToken);

    /// <summary>
    /// Gets an SMS template by ID.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The template if found.</returns>
    Task<SmsTemplateResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a new SMS template.
    /// </summary>
    /// <param name="request">The creation request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created template.</returns>
    Task<SmsTemplateResponse> CreateAsync(CreateSmsTemplateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an existing SMS template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated template if found.</returns>
    Task<SmsTemplateResponse?> UpdateAsync(Guid id, UpdateSmsTemplateRequest request, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes an SMS template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted.</returns>
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Increments the usage count of a template.
    /// </summary>
    /// <param name="id">The template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated template if found.</returns>
    Task<SmsTemplateResponse?> IncrementUsageAsync(Guid id, CancellationToken cancellationToken);
}
