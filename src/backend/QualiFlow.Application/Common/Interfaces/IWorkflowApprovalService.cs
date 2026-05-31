// <copyright file="IWorkflowApprovalService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Workflows.Admin.DTOs;

namespace QualiFlow.Application.Common.Interfaces;

/// <summary>
/// Service interface for workflow approval request management.
/// </summary>
public interface IWorkflowApprovalService
{
    /// <summary>
    /// Gets all approval requests with optional filtering.
    /// </summary>
    /// <param name="businessId">Optional business ID filter.</param>
    /// <param name="status">Optional status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of approval requests.</returns>
    Task<IReadOnlyCollection<WorkflowApprovalRequestDto>> GetApprovalRequestsAsync(
        Guid? businessId = null,
        string? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an approval request by ID.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Approval request or null if not found.</returns>
    Task<WorkflowApprovalRequestDto?> GetApprovalRequestByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new approval request.
    /// </summary>
    /// <param name="businessId">Business ID.</param>
    /// <param name="templateId">Template ID.</param>
    /// <param name="requestedBy">User requesting approval.</param>
    /// <param name="customConfiguration">Custom configuration.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created approval request.</returns>
    Task<WorkflowApprovalRequestDto> CreateApprovalRequestAsync(
        Guid businessId,
        Guid templateId,
        string requestedBy,
        object? customConfiguration = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Approves an approval request.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="approvedBy">User approving the request.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if approved, false if not found.</returns>
    Task<bool> ApproveRequestAsync(
        Guid id,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Rejects an approval request.
    /// </summary>
    /// <param name="id">Approval request ID.</param>
    /// <param name="rejectedBy">User rejecting the request.</param>
    /// <param name="rejectionReason">Reason for rejection.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if rejected, false if not found.</returns>
    Task<bool> RejectRequestAsync(
        Guid id,
        string rejectedBy,
        string? rejectionReason = null,
        CancellationToken cancellationToken = default);
}
