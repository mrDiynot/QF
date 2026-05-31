using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services.Workflows;

/// <summary>
/// Service for managing business workflows.
/// </summary>
public class BusinessWorkflowService : IBusinessWorkflowService
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="BusinessWorkflowService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    public BusinessWorkflowService(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyCollection<BusinessWorkflowDto>> GetBusinessWorkflowsAsync(
        Guid businessId,
        string? search = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BusinessWorkflows
            .Include(bw => bw.Template)
            .Include(bw => bw.Executions)
            .Where(bw => bw.BusinessId == businessId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(bw =>
                bw.Template.Name.Contains(search) ||
                bw.Template.Description.Contains(search));
        }

        if (isActive.HasValue)
        {
            query = query.Where(bw => bw.IsActive == isActive.Value);
        }

        var workflows = await query
            .OrderByDescending(bw => bw.CreatedAt)
            .ToListAsync(cancellationToken);

        return workflows.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<BusinessWorkflowDto?> GetBusinessWorkflowByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var workflow = await _context.BusinessWorkflows
            .Include(bw => bw.Template)
            .Include(bw => bw.Executions)
            .FirstOrDefaultAsync(bw => bw.Id == id, cancellationToken);

        return workflow == null ? null : MapToDto(workflow);
    }

    /// <inheritdoc/>
    public async Task<BusinessWorkflowDto> ActivateWorkflowAsync(
        Guid businessId,
        Guid templateId,
        object? customConfiguration = null,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId, cancellationToken)
            ?? throw new InvalidOperationException($"Template {templateId} not found");

        if (!template.IsActive)
        {
            throw new InvalidOperationException($"Template {templateId} is not active");
        }

        // Check if workflow already exists for this business
        var existingWorkflow = await _context.BusinessWorkflows
            .FirstOrDefaultAsync(
                bw => bw.BusinessId == businessId &&
                      bw.TemplateId == templateId &&
                      bw.DeletedAt == null,
                cancellationToken);

        if (existingWorkflow != null)
        {
            existingWorkflow.IsActive = true;
            existingWorkflow.CustomConfiguration = customConfiguration?.ToString() ?? string.Empty;
            await _context.SaveChangesAsync(cancellationToken);
            return await GetBusinessWorkflowByIdAsync(existingWorkflow.Id, cancellationToken)
                ?? throw new InvalidOperationException("Failed to retrieve workflow");
        }

        // Create new business workflow
        var businessWorkflow = new BusinessWorkflow
        {
            BusinessId = businessId,
            TemplateId = templateId,
            IsActive = true,
            IsApproved = !template.RequiresApproval,
            CustomConfiguration = customConfiguration?.ToString() ?? string.Empty,
            TotalExecutions = 0,
            SuccessfulExecutions = 0,
            FailedExecutions = 0
        };

        _context.BusinessWorkflows.Add(businessWorkflow);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetBusinessWorkflowByIdAsync(businessWorkflow.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve created workflow");
    }

    /// <inheritdoc/>
    public async Task<bool> DeactivateWorkflowAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var workflow = await _context.BusinessWorkflows
            .FirstOrDefaultAsync(bw => bw.Id == id, cancellationToken);

        if (workflow == null)
        {
            return false;
        }

        workflow.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteBusinessWorkflowAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var workflow = await _context.BusinessWorkflows
            .FirstOrDefaultAsync(bw => bw.Id == id, cancellationToken);

        if (workflow == null)
        {
            return false;
        }

        workflow.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc/>
    public async Task<WorkflowQuotaDto> GetWorkflowQuotaAsync(
        Guid businessId,
        CancellationToken cancellationToken = default)
    {
        var business = await _context.Businesses
            .Include(b => b.Subscription)
                .ThenInclude(s => s!.Plan)
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken)
            ?? throw new InvalidOperationException($"Business {businessId} not found");

        var activeWorkflows = await _context.BusinessWorkflows
            .Include(bw => bw.Template)
            .Where(bw => bw.BusinessId == businessId && bw.IsActive)
            .ToListAsync(cancellationToken);

        // Get plan-specific quota (default to 5 for trial/starter, 20 for professional, unlimited for enterprise)
        var maxWorkflows = business.Subscription?.Plan?.Name switch
        {
            "Trial" => 3,
            "Starter" => 5,
            "Professional" => 20,
            "Business" => 50,
            "Enterprise" => int.MaxValue,
            _ => 5
        };

        var usedSlots = activeWorkflows.Count;
        var availableSlots = maxWorkflows == int.MaxValue ? int.MaxValue : Math.Max(0, maxWorkflows - usedSlots);
        var utilization = maxWorkflows == int.MaxValue ? 0 : (double)usedSlots / maxWorkflows * 100;

        return new WorkflowQuotaDto
        {
            BusinessId = businessId,
            MaxWorkflows = maxWorkflows,
            ActiveWorkflows = usedSlots,
            AvailableSlots = availableSlots,
            UtilizationPercentage = utilization,
            Workflows = activeWorkflows.Select(MapToDto).ToList()
        };
    }

    private static BusinessWorkflowDto MapToDto(BusinessWorkflow workflow)
    {
        return new BusinessWorkflowDto
        {
            Id = workflow.Id,
            BusinessId = workflow.BusinessId,
            TemplateId = workflow.TemplateId,
            TemplateName = workflow.Template?.Name ?? "Unknown",
            IsActive = workflow.IsActive,
            IsApproved = workflow.IsApproved,
            CustomConfiguration = workflow.CustomConfiguration,
            TotalExecutions = workflow.TotalExecutions,
            SuccessfulExecutions = workflow.SuccessfulExecutions,
            FailedExecutions = workflow.FailedExecutions,
            LastExecutedAt = workflow.LastExecutedAt,
            CreatedAt = workflow.CreatedAt,
            ActivatedAt = workflow.CreatedAt
        };
    }
}
