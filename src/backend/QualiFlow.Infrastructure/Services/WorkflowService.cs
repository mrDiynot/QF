// <copyright file="WorkflowService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using System.Text.Json;
using Microsoft.Extensions.Logging;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Services;

/// <summary>
/// Service implementation for workflow business logic operations.
/// </summary>
public class WorkflowService : IWorkflowService
{
    private readonly IWorkflowHost _workflowHost;
    private readonly IQualiFlowWorkflowRepository _workflowRepository;
    private readonly ILogger<WorkflowService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowService"/> class.
    /// </summary>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="workflowRepository">The workflow repository.</param>
    /// <param name="logger">The logger.</param>
    public WorkflowService(
        IWorkflowHost workflowHost,
        IQualiFlowWorkflowRepository workflowRepository,
        ILogger<WorkflowService> logger)
    {
        _workflowHost = workflowHost;
        _workflowRepository = workflowRepository;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance> StartWorkflowAsync(
        Guid businessId,
        string workflowId,
        int version,
        string data,
        string? referenceId,
        CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;

        _logger.LogInformation(
            "Starting workflow {WorkflowId} v{Version} for business {BusinessId} at {StartTime}",
            workflowId,
            version,
            businessId,
            startTime);

        try
        {
            // Deserialize workflow data
            var workflowData = JsonSerializer.Deserialize<object>(data);

            // Start the workflow in Workflow Core
            var workflowCoreId = await _workflowHost.StartWorkflow(workflowId, version, workflowData);

            _logger.LogInformation(
                "Workflow Core started workflow instance {WorkflowCoreId} in {ElapsedMs}ms",
                workflowCoreId,
                (DateTime.UtcNow - startTime).TotalMilliseconds);

            // Create workflow instance record in database
            var workflowInstance = new WorkflowInstance
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                WorkflowCoreId = workflowCoreId,
                WorkflowDefinitionId = Guid.Parse(workflowId),
                Status = WorkflowStatus.Running,
                DataJson = data,
                StartedAt = startTime,
                CreatedAt = startTime,
            };

            await _workflowRepository.CreateWorkflowInstanceAsync(workflowInstance, cancellationToken);

            _logger.LogInformation(
                "Created workflow instance {WorkflowInstanceId} for Workflow Core ID {WorkflowCoreId}. Total startup time: {TotalElapsedMs}ms",
                workflowInstance.Id,
                workflowCoreId,
                (DateTime.UtcNow - startTime).TotalMilliseconds);

            return workflowInstance;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to start workflow {WorkflowId} v{Version} for business {BusinessId} after {ElapsedMs}ms",
                workflowId,
                version,
                businessId,
                (DateTime.UtcNow - startTime).TotalMilliseconds);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance?> GetWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _workflowRepository.GetWorkflowInstanceByIdAsync(id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance?> GetWorkflowInstanceByWorkflowCoreIdAsync(string workflowCoreId, CancellationToken cancellationToken)
    {
        return await _workflowRepository.GetWorkflowInstanceByWorkflowCoreIdAsync(workflowCoreId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<WorkflowInstance>> GetWorkflowInstancesByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return await _workflowRepository.GetWorkflowInstancesByBusinessIdAsync(businessId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task UpdateWorkflowInstanceStatusAsync(
        string workflowCoreId,
        string status,
        string? outputData,
        CancellationToken cancellationToken)
    {
        var workflowInstance = await _workflowRepository.GetWorkflowInstanceByWorkflowCoreIdAsync(workflowCoreId, cancellationToken);

        if (workflowInstance == null)
        {
            _logger.LogWarning("Workflow instance with Workflow Core ID {WorkflowCoreId} not found", workflowCoreId);
            return;
        }

        var previousStatus = workflowInstance.Status;
        var executionTimeMs = workflowInstance.StartedAt.HasValue
            ? (DateTime.UtcNow - workflowInstance.StartedAt.Value).TotalMilliseconds
            : 0;

        // Parse status string to enum
        if (Enum.TryParse<WorkflowStatus>(status, true, out var workflowStatus))
        {
            workflowInstance.Status = workflowStatus;
        }

        if (!string.IsNullOrEmpty(outputData))
        {
            workflowInstance.DataJson = outputData;
        }

        workflowInstance.UpdatedAt = DateTime.UtcNow;

        await _workflowRepository.UpdateWorkflowInstanceAsync(workflowInstance, cancellationToken);

        _logger.LogInformation(
            "Updated workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) for business {BusinessId}. Status changed from {PreviousStatus} to {NewStatus}. Current execution time: {ExecutionTimeMs}ms",
            workflowInstance.Id,
            workflowCoreId,
            workflowInstance.BusinessId,
            previousStatus,
            status,
            executionTimeMs);
    }

    /// <inheritdoc/>
    public async Task CompleteWorkflowInstanceAsync(
        string workflowCoreId,
        string? outputData,
        CancellationToken cancellationToken)
    {
        var workflowInstance = await _workflowRepository.GetWorkflowInstanceByWorkflowCoreIdAsync(workflowCoreId, cancellationToken);

        if (workflowInstance == null)
        {
            _logger.LogWarning("Workflow instance with Workflow Core ID {WorkflowCoreId} not found", workflowCoreId);
            return;
        }

        var completedAt = DateTime.UtcNow;
        var executionTimeMs = workflowInstance.StartedAt.HasValue
            ? (completedAt - workflowInstance.StartedAt.Value).TotalMilliseconds
            : 0;

        workflowInstance.Status = WorkflowStatus.Complete;

        if (!string.IsNullOrEmpty(outputData))
        {
            workflowInstance.DataJson = outputData;
        }

        workflowInstance.CompletedAt = completedAt;
        workflowInstance.UpdatedAt = completedAt;

        await _workflowRepository.UpdateWorkflowInstanceAsync(workflowInstance, cancellationToken);

        _logger.LogInformation(
            "Completed workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) for business {BusinessId}. Execution time: {ExecutionTimeMs}ms",
            workflowInstance.Id,
            workflowCoreId,
            workflowInstance.BusinessId,
            executionTimeMs);
    }

    /// <inheritdoc/>
    public async Task FailWorkflowInstanceAsync(
        string workflowCoreId,
        string errorMessage,
        CancellationToken cancellationToken)
    {
        var workflowInstance = await _workflowRepository.GetWorkflowInstanceByWorkflowCoreIdAsync(workflowCoreId, cancellationToken);

        if (workflowInstance == null)
        {
            _logger.LogWarning("Workflow instance with Workflow Core ID {WorkflowCoreId} not found", workflowCoreId);
            return;
        }

        var failedAt = DateTime.UtcNow;
        var executionTimeMs = workflowInstance.StartedAt.HasValue
            ? (failedAt - workflowInstance.StartedAt.Value).TotalMilliseconds
            : 0;

        workflowInstance.Status = WorkflowStatus.Error;
        workflowInstance.ErrorMessage = errorMessage;
        workflowInstance.CompletedAt = failedAt;
        workflowInstance.UpdatedAt = failedAt;

        await _workflowRepository.UpdateWorkflowInstanceAsync(workflowInstance, cancellationToken);

        _logger.LogError(
            "Workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) failed for business {BusinessId} after {ExecutionTimeMs}ms. Error: {ErrorMessage}",
            workflowInstance.Id,
            workflowCoreId,
            workflowInstance.BusinessId,
            executionTimeMs,
            errorMessage);
    }

    /// <inheritdoc/>
    public async Task CancelWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken)
    {
        var workflowInstance = await _workflowRepository.GetWorkflowInstanceByIdAsync(id, cancellationToken);

        if (workflowInstance == null)
        {
            _logger.LogWarning("Workflow instance {WorkflowInstanceId} not found", id);
            return;
        }

        _logger.LogInformation(
            "Attempting to cancel workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) for business {BusinessId}",
            id,
            workflowInstance.WorkflowCoreId,
            workflowInstance.BusinessId);

        // Terminate the workflow in Workflow Core
        var result = await _workflowHost.TerminateWorkflow(workflowInstance.WorkflowCoreId);

        if (result)
        {
            var cancelledAt = DateTime.UtcNow;
            var executionTimeMs = workflowInstance.StartedAt.HasValue
                ? (cancelledAt - workflowInstance.StartedAt.Value).TotalMilliseconds
                : 0;

            workflowInstance.Status = WorkflowStatus.Terminated;
            workflowInstance.CompletedAt = cancelledAt;
            workflowInstance.UpdatedAt = cancelledAt;

            await _workflowRepository.UpdateWorkflowInstanceAsync(workflowInstance, cancellationToken);

            _logger.LogInformation(
                "Successfully cancelled workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) for business {BusinessId}. Execution time before cancellation: {ExecutionTimeMs}ms",
                id,
                workflowInstance.WorkflowCoreId,
                workflowInstance.BusinessId,
                executionTimeMs);
        }
        else
        {
            _logger.LogWarning(
                "Failed to cancel workflow instance {WorkflowInstanceId} (Workflow Core ID: {WorkflowCoreId}) in Workflow Core",
                id,
                workflowInstance.WorkflowCoreId);
        }
    }
}

