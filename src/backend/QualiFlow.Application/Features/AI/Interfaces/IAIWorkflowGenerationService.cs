// -----------------------------------------------------------------------
// <copyright file="IAIWorkflowGenerationService.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Application.Features.AI.DTOs;

namespace QualiFlow.Application.Features.AI.Interfaces;

/// <summary>
/// Service for AI-powered workflow generation.
/// Generates complete workflow definitions from natural language descriptions.
/// </summary>
public interface IAIWorkflowGenerationService
{
    /// <summary>
    /// Generates a workflow definition using AI based on a natural language goal.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="request">The generation request parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated workflow result.</returns>
    Task<WorkflowGenerationResult> GenerateWorkflowAsync(
        Guid businessId,
        WorkflowGenerationRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves a generated workflow as a template.
    /// </summary>
    /// <param name="businessId">The business ID for multi-tenancy.</param>
    /// <param name="workflow">The workflow result to save.</param>
    /// <param name="userId">The user creating the workflow.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the saved workflow template.</returns>
    Task<Guid> SaveWorkflowAsync(
        Guid businessId,
        WorkflowGenerationResult workflow,
        Guid userId,
        CancellationToken cancellationToken = default);
}

