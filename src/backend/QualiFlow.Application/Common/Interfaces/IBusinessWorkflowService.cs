// <copyright file="IBusinessWorkflowService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for business workflow management.
/// </summary>
public interface IBusinessWorkflowService
{
    /// <summary>
    /// Gets all workflows for a specific business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="search">Optional search term.</param>
    /// <param name="isActive">Optional active status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of business workflows.</returns>
    Task<IReadOnlyCollection<BusinessWorkflowDto>> GetBusinessWorkflowsAsync(
        Guid businessId,
        string? search = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a business workflow by ID.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Business workflow or null if not found.</returns>
    Task<BusinessWorkflowDto?> GetBusinessWorkflowByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Activates a workflow template for a business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="templateId">Template ID.</param>
    /// <param name="customConfiguration">Optional custom configuration.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created business workflow.</returns>
    Task<BusinessWorkflowDto> ActivateWorkflowAsync(
        Guid businessId,
        Guid templateId,
        object? customConfiguration = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deactivates a business workflow.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deactivated, false if not found.</returns>
    Task<bool> DeactivateWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a business workflow.
    /// </summary>
    /// <param name="id">Workflow ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deleted, false if not found.</returns>
    Task<bool> DeleteBusinessWorkflowAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets workflow quota information for a business.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Quota information.</returns>
    Task<WorkflowQuotaDto> GetWorkflowQuotaAsync(Guid businessId, CancellationToken cancellationToken = default);
}

/// <summary>
/// DTO for workflow quota information.
/// </summary>
public class WorkflowQuotaDto
{
    /// <summary>
    /// Gets or sets the business ID.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string BusinessName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the subscription tier.
    /// </summary>
    public string PlanTier { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the maximum number of workflows allowed.
    /// </summary>
    public int MaxWorkflows { get; set; }

    /// <summary>
    /// Gets or sets the number of active workflows.
    /// </summary>
    public int ActiveWorkflows { get; set; }

    /// <summary>
    /// Gets or sets the number of available slots.
    /// </summary>
    public int AvailableSlots { get; set; }

    /// <summary>
    /// Gets or sets the utilization percentage.
    /// </summary>
    public double UtilizationPercentage { get; set; }

    /// <summary>
    /// Gets the list of active workflows.
    /// </summary>
    public IReadOnlyCollection<BusinessWorkflowDto> Workflows { get; init; } = [];
}
