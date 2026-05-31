// <copyright file="WorkflowApprovalService.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services.Workflows;

/// <summary>
/// Service for managing workflow approval requests.
/// </summary>
public class WorkflowApprovalService : IWorkflowApprovalService
{
    private readonly QualiFlowDbContext _context;
    private readonly IBusinessWorkflowService _businessWorkflowService;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowApprovalService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    /// <param name="businessWorkflowService">Business workflow service.</param>
    public WorkflowApprovalService(
        QualiFlowDbContext context,
        IBusinessWorkflowService businessWorkflowService)
    {
        _context = context;
        _businessWorkflowService = businessWorkflowService;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyCollection<WorkflowApprovalRequestDto>> GetApprovalRequestsAsync(
        Guid? businessId = null,
        string? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.WorkflowApprovalRequests
            .Include(r => r.WorkflowTemplate)
            .AsQueryable();

        if (businessId.HasValue)
        {
            query = query.Where(r => r.BusinessId == businessId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(r => r.Status == status);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return requests.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<WorkflowApprovalRequestDto?> GetApprovalRequestByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var request = await _context.WorkflowApprovalRequests
            .Include(r => r.WorkflowTemplate)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        return request == null ? null : MapToDto(request);
    }

    /// <inheritdoc/>
    public async Task<WorkflowApprovalRequestDto> CreateApprovalRequestAsync(
        Guid businessId,
        Guid templateId,
        string requestedBy,
        object? customConfiguration = null,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId, cancellationToken)
            ?? throw new InvalidOperationException($"Template {templateId} not found");

        if (!template.RequiresApproval)
        {
            throw new InvalidOperationException($"Template {template.Name} does not require approval");
        }

        var approvalRequest = new WorkflowApprovalRequest
        {
            BusinessId = businessId,
            WorkflowTemplateId = templateId,
            RequestedByUserId = Guid.TryParse(requestedBy, out var userId) ? userId : Guid.Empty,
            RequestedByEmail = requestedBy,
            CustomConfiguration = customConfiguration?.ToString() ?? "{}",
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };

        _context.WorkflowApprovalRequests.Add(approvalRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetApprovalRequestByIdAsync(approvalRequest.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve created approval request");
    }

    /// <inheritdoc/>
    public async Task<bool> ApproveRequestAsync(
        Guid id,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        var request = await _context.WorkflowApprovalRequests
            .Include(r => r.WorkflowTemplate)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request == null)
        {
            return false;
        }

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException($"Request is already {request.Status}");
        }

        request.Status = "Approved";
        request.ReviewedBy = approvedBy;
        request.ReviewedAt = DateTime.UtcNow;

        // Automatically activate the workflow
        await _businessWorkflowService.ActivateWorkflowAsync(
            request.BusinessId,
            request.WorkflowTemplateId,
            string.IsNullOrEmpty(request.CustomConfiguration) ? null : request.CustomConfiguration,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> RejectRequestAsync(
        Guid id,
        string rejectedBy,
        string? rejectionReason = null,
        CancellationToken cancellationToken = default)
    {
        var request = await _context.WorkflowApprovalRequests
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (request == null)
        {
            return false;
        }

        if (request.Status != "Pending")
        {
            throw new InvalidOperationException($"Request is already {request.Status}");
        }

        request.Status = "Rejected";
        request.ReviewedBy = rejectedBy;
        request.ReviewedAt = DateTime.UtcNow;
        request.ReviewNotes = rejectionReason;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static WorkflowApprovalRequestDto MapToDto(WorkflowApprovalRequest request)
    {
        return new WorkflowApprovalRequestDto
        {
            Id = request.Id,
            BusinessId = request.BusinessId,
            WorkflowTemplateId = request.WorkflowTemplateId,
            WorkflowName = request.WorkflowTemplate?.Name ?? "Unknown",
            RequestedByUserId = request.RequestedByUserId,
            RequestedByEmail = request.RequestedByEmail,
            RequestReason = request.RequestReason,
            CustomConfiguration = string.IsNullOrEmpty(request.CustomConfiguration)
                ? null
                : System.Text.Json.JsonSerializer.Deserialize<object>(request.CustomConfiguration),
            Status = request.Status,
            ReviewedBy = request.ReviewedBy,
            ReviewedAt = request.ReviewedAt,
            ReviewNotes = request.ReviewNotes,
            RequestedAt = request.RequestedAt,
            ExpiresAt = request.ExpiresAt
        };
    }
}
