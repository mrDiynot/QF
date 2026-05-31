// <copyright file="IWorkflowService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Entities;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for workflow business logic operations.
/// Provides high-level workflow management and execution tracking.
/// </summary>
public interface IWorkflowService
{
    /// <summary>
    /// Starts a new workflow instance and tracks it in the database.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="workflowId">The workflow definition ID.</param>
    /// <param name="version">The workflow version.</param>
    /// <param name="data">The workflow data as JSON string.</param>
    /// <param name="referenceId">Optional reference ID (e.g., lead ID, conversation ID).</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The created workflow instance.</returns>
    Task<WorkflowInstance> StartWorkflowAsync(
        Guid businessId,
        string workflowId,
        int version,
        string data,
        string? referenceId,
        CancellationToken cancellationToken);

    /// <summary>
    /// Gets a workflow instance by ID.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The workflow instance, or null if not found.</returns>
    Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken);

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
    /// Updates a workflow instance status and output data.
    /// </summary>
    /// <param name="workflowCoreId">The Workflow Core internal ID.</param>
    /// <param name="status">The new status.</param>
    /// <param name="outputData">The workflow output data as JSON string.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateWorkflowInstanceStatusAsync(
        string workflowCoreId,
        string status,
        string? outputData,
        CancellationToken cancellationToken);

    /// <summary>
    /// Marks a workflow instance as completed.
    /// </summary>
    /// <param name="workflowCoreId">The Workflow Core internal ID.</param>
    /// <param name="outputData">The workflow output data as JSON string.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CompleteWorkflowInstanceAsync(
        string workflowCoreId,
        string? outputData,
        CancellationToken cancellationToken);

    /// <summary>
    /// Marks a workflow instance as failed.
    /// </summary>
    /// <param name="workflowCoreId">The Workflow Core internal ID.</param>
    /// <param name="errorMessage">The error message.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task FailWorkflowInstanceAsync(
        string workflowCoreId,
        string errorMessage,
        CancellationToken cancellationToken);

    /// <summary>
    /// Cancels a workflow instance.
    /// </summary>
    /// <param name="id">The workflow instance ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task CancelWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken);
}

