// <copyright file="IWorkflowTemplateService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for workflow template management.
/// </summary>
public interface IWorkflowTemplateService
{
    /// <summary>
    /// Gets all workflow templates with optional filtering.
    /// </summary>
    /// <param name="search">Optional search term.</param>
    /// <param name="category">Optional category filter.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of workflow templates.</returns>
    Task<IReadOnlyCollection<WorkflowTemplateDto>> GetTemplatesAsync(
        string? search = null,
        string? category = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a workflow template by ID.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Workflow template or null if not found.</returns>
    Task<WorkflowTemplateDto?> GetTemplateByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new workflow template.
    /// </summary>
    /// <param name="request">Create request.</param>
    /// <param name="createdBy">Admin user creating the template.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created workflow template.</returns>
    Task<WorkflowTemplateDto> CreateTemplateAsync(
        CreateWorkflowTemplateRequest request,
        string createdBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing workflow template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="request">Update request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated workflow template or null if not found.</returns>
    Task<WorkflowTemplateDto?> UpdateTemplateAsync(
        Guid id,
        UpdateWorkflowTemplateRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a workflow template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteTemplateAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets analytics for a specific template.
    /// </summary>
    /// <param name="id">Template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Template analytics or null if not found.</returns>
    Task<WorkflowAnalyticsDto?> GetTemplateAnalyticsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets platform-wide workflow analytics.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Platform analytics.</returns>
    Task<WorkflowAnalyticsDto> GetPlatformAnalyticsAsync(CancellationToken cancellationToken = default);
}
