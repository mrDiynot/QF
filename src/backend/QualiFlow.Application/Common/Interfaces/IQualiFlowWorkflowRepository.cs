// <copyright file="IQualiFlowWorkflowRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Repository interface for workflow management operations.
/// Provides CRUD operations for WorkflowDefinition and WorkflowInstance entities.
/// Named IQualiFlowWorkflowRepository to avoid conflict with WorkflowCore.Interface.IWorkflowRepository.
/// </summary>
public interface IQualiFlowWorkflowRepository
{
    /// <summary>
    /// Gets a workflow definition by ID.
    /// </summary>
    /// <param name="id">The workflow definition ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow definition, or null if not found.</returns>
    Task<WorkflowDefinition?> GetWorkflowDefinitionByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets all workflow definitions for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of workflow definitions.</returns>
    Task<IEnumerable<WorkflowDefinition>> GetWorkflowDefinitionsByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a new workflow definition.
    /// </summary>
    /// <param name="workflowDefinition">The workflow definition to create.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created workflow definition.</returns>
    Task<WorkflowDefinition> CreateWorkflowDefinitionAsync(WorkflowDefinition workflowDefinition, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an existing workflow definition.
    /// </summary>
    /// <param name="workflowDefinition">The workflow definition to update.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateWorkflowDefinitionAsync(WorkflowDefinition workflowDefinition, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a workflow definition.
    /// </summary>
    /// <param name="id">The workflow definition ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteWorkflowDefinitionAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets a workflow instance by ID.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow instance, or null if not found.</returns>
    Task<WorkflowInstance?> GetWorkflowInstanceByIdAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>
    /// Gets a workflow instance by Workflow Core ID.
    /// </summary>
    /// <param name="workflowCoreId">The Workflow Core internal ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow instance, or null if not found.</returns>
    Task<WorkflowInstance?> GetWorkflowInstanceByWorkflowCoreIdAsync(string workflowCoreId, CancellationToken cancellationToken);

    /// <summary>
    /// Gets all workflow instances for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The list of workflow instances.</returns>
    Task<IEnumerable<WorkflowInstance>> GetWorkflowInstancesByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken);

    /// <summary>
    /// Creates a new workflow instance.
    /// </summary>
    /// <param name="workflowInstance">The workflow instance to create.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created workflow instance.</returns>
    Task<WorkflowInstance> CreateWorkflowInstanceAsync(WorkflowInstance workflowInstance, CancellationToken cancellationToken);

    /// <summary>
    /// Updates an existing workflow instance.
    /// </summary>
    /// <param name="workflowInstance">The workflow instance to update.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateWorkflowInstanceAsync(WorkflowInstance workflowInstance, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a workflow instance.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken);
}

