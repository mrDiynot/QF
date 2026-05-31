// <copyright file="IWorkflowSubscriptionService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Enums;

namespace QualiFlow.Application.Features.Workflows.Services;

/// <summary>
/// Service interface for workflow subscription enforcement.
/// Controls which workflows businesses can access based on their subscription tier.
/// </summary>
public interface IWorkflowSubscriptionService
{
    /// <summary>
    /// Checks if a business can activate a specific workflow based on their subscription.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="workflowId">The workflow template ID or workflow definition ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the business can activate the workflow, false otherwise.</returns>
    Task<bool> CanActivateWorkflowAsync(Guid businessId, string workflowId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a business can execute a workflow (run it).
    /// FreeFlow tier can only view, not execute.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="workflowId">The workflow ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the business can execute the workflow, false otherwise.</returns>
    Task<bool> CanExecuteWorkflowAsync(Guid businessId, string workflowId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the list of workflow IDs available to a business based on their subscription.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>List of workflow IDs the business can access.</returns>
    Task<IEnumerable<string>> GetAvailableWorkflowsAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the minimum tier required for a specific workflow.
    /// </summary>
    /// <param name="workflowId">The workflow ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>The minimum subscription tier required.</returns>
    Task<SubscriptionTier> GetRequiredTierAsync(string workflowId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a business has reached their workflow instance limit.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if limit reached, false otherwise.</returns>
    Task<bool> HasReachedWorkflowLimitAsync(Guid businessId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the workflow usage statistics for a business.
    /// </summary>
    /// <param name="businessId">The business ID.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Workflow usage statistics.</returns>
    Task<WorkflowUsageStats> GetWorkflowUsageAsync(Guid businessId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Workflow usage statistics for a business.
/// </summary>
public record WorkflowUsageStats
{
    /// <summary>
    /// Gets the current subscription tier.
    /// </summary>
    public SubscriptionTier CurrentTier { get; init; }

    /// <summary>
    /// Gets the number of available workflows for the tier.
    /// </summary>
    public int AvailableWorkflows { get; init; }

    /// <summary>
    /// Gets the number of active workflows.
    /// </summary>
    public int ActiveWorkflows { get; init; }

    /// <summary>
    /// Gets the total workflow executions this month.
    /// </summary>
    public int MonthlyExecutions { get; init; }

    /// <summary>
    /// Gets the maximum workflow instances allowed (null = unlimited).
    /// </summary>
    public int? MaxInstances { get; init; }

    /// <summary>
    /// Gets a value indicating whether custom workflows are allowed.
    /// </summary>
    public bool CanCreateCustomWorkflows { get; init; }

    /// <summary>
    /// Gets a value indicating whether the visual builder is available.
    /// </summary>
    public bool HasVisualBuilder { get; init; }
}
