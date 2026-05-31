using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Application.Features.Workflows.Admin.DTOs;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Services.Workflows;

/// <summary>
/// Service for managing workflow templates.
/// </summary>
public class WorkflowTemplateService : IWorkflowTemplateService
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowTemplateService"/> class.
    /// </summary>
    /// <param name="context">Database context.</param>
    public WorkflowTemplateService(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyCollection<WorkflowTemplateDto>> GetTemplatesAsync(
        string? search = null,
        string? category = null,
        bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.WorkflowTemplates
            .Include(t => t.PlanAssignments)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t =>
                t.Name.Contains(search) ||
                t.Description.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<WorkflowCategory>(category, true, out var categoryEnum))
        {
            query = query.Where(t => t.Category == categoryEnum);
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var templates = await query
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

        return templates.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<WorkflowTemplateDto?> GetTemplateByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .Include(t => t.PlanAssignments)
            .Include(t => t.BusinessWorkflows)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        return template == null ? null : MapToDto(template);
    }

    /// <inheritdoc/>
    public async Task<WorkflowTemplateDto> CreateTemplateAsync(
        CreateWorkflowTemplateRequest request,
        string createdBy,
        CancellationToken cancellationToken = default)
    {
        var template = new WorkflowTemplate
        {
            Name = request.Name,
            Description = request.Description,
            Category = Enum.TryParse<WorkflowCategory>(request.Category, true, out var categoryEnum) ? categoryEnum : WorkflowCategory.Custom,
            IsActive = request.IsActive,
            IsGlobalTemplate = true,
            RequiresApproval = request.RequiresApproval,
            DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(request.DefaultTrigger),
            DefaultSteps = System.Text.Json.JsonSerializer.Serialize(request.DefaultSteps),
            ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(request.ConfigurableFields),
            CreatedBy = createdBy,
            Version = 1
        };

        _context.WorkflowTemplates.Add(template);

        // Create plan assignments
        foreach (var planName in request.AssignedToPlans)
        {
            if (Enum.TryParse<SubscriptionTier>(planName, true, out var tier))
            {
                var assignment = new WorkflowPlanAssignment
                {
                    WorkflowTemplateId = template.Id,
                    PlanTier = tier,
                    IsIncluded = true,
                    RequiresApproval = request.RequiresApproval,
                    AssignedBy = createdBy
                };
                _context.WorkflowPlanAssignments.Add(assignment);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetTemplateByIdAsync(template.Id, cancellationToken)
            ?? throw new InvalidOperationException("Failed to retrieve created template");
    }

    /// <inheritdoc/>
    public async Task<WorkflowTemplateDto?> UpdateTemplateAsync(
        Guid id,
        UpdateWorkflowTemplateRequest request,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .Include(t => t.PlanAssignments)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"Template {id} not found");

        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            template.Name = request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            template.Description = request.Description;
        }

        if (request.IsActive.HasValue)
        {
            template.IsActive = request.IsActive.Value;
        }

        if (request.RequiresApproval.HasValue)
        {
            template.RequiresApproval = request.RequiresApproval.Value;
        }

        if (request.DefaultTrigger != null)
        {
            template.DefaultTrigger = System.Text.Json.JsonSerializer.Serialize(request.DefaultTrigger);
        }

        if (request.DefaultSteps != null)
        {
            template.DefaultSteps = System.Text.Json.JsonSerializer.Serialize(request.DefaultSteps);
            template.Version++;
        }

        if (request.ConfigurableFields != null)
        {
            template.ConfigurableFields = System.Text.Json.JsonSerializer.Serialize(request.ConfigurableFields);
        }

        // Update plan assignments if provided
        if (request.AssignedToPlans != null)
        {
            // Remove existing assignments
            _context.WorkflowPlanAssignments.RemoveRange(template.PlanAssignments);

            // Add new assignments
            foreach (var planName in request.AssignedToPlans)
            {
                if (Enum.TryParse<SubscriptionTier>(planName, true, out var tier))
                {
                    var assignment = new WorkflowPlanAssignment
                    {
                        WorkflowTemplateId = template.Id,
                        PlanTier = tier,
                        IsIncluded = true,
                        RequiresApproval = template.RequiresApproval,
                        AssignedBy = template.CreatedBy
                    };
                    _context.WorkflowPlanAssignments.Add(assignment);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetTemplateByIdAsync(id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<bool> DeleteTemplateAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (template == null)
        {
            return false;
        }

        template.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <inheritdoc/>
    public async Task<WorkflowAnalyticsDto?> GetTemplateAnalyticsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var template = await _context.WorkflowTemplates
            .Include(t => t.BusinessWorkflows)
                .ThenInclude(bw => bw.Executions)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (template == null)
        {
            return null;
        }

        var executions = template.BusinessWorkflows
            .SelectMany(bw => bw.Executions)
            .ToList();

        var totalExecutions = executions.Count;
        var successfulExecutions = executions.Count(e => e.Status == WorkflowStatus.Complete);
        var failedExecutions = executions.Count(e => e.Status == WorkflowStatus.Error);
        var activeBusinesses = template.BusinessWorkflows.Count(bw => bw.IsActive);

        var successRate = totalExecutions > 0
            ? (double)successfulExecutions / totalExecutions * 100
            : 0;

        var avgExecutionTime = executions
            .Where(e => e.CompletedAt.HasValue && e.StartedAt.HasValue)
            .Select(e => (e.CompletedAt!.Value - e.StartedAt!.Value).TotalSeconds)
            .DefaultIfEmpty(0)
            .Average();

        return new WorkflowAnalyticsDto
        {
            TotalTemplates = 1,
            ActiveTemplates = template.IsActive ? 1 : 0,
            TotalBusinessWorkflows = activeBusinesses,
            ActiveBusinessWorkflows = activeBusinesses,
            TotalExecutions = totalExecutions,
            SuccessfulExecutions = successfulExecutions,
            FailedExecutions = failedExecutions,
            OverallSuccessRate = successRate,
            AverageExecutionTime = avgExecutionTime,
            TopTemplates =
            [
                new TemplateUsageDto
                {
                    TemplateId = template.Id,
                    Name = template.Name,
                    Executions = totalExecutions,
                    SuccessRate = successRate
                }
            ],
            ExecutionTrend = []
        };
    }

    /// <inheritdoc/>
    public async Task<WorkflowAnalyticsDto> GetPlatformAnalyticsAsync(
        CancellationToken cancellationToken = default)
    {
        // Optimization: Use database-level aggregations instead of loading all data into memory

        // Query 1: Template counts (lightweight)
        var templateCounts = await _context.WorkflowTemplates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .CountAsync(cancellationToken);

        // Query 2: Business workflow counts (database aggregation)
        var workflowCounts = await _context.BusinessWorkflows
            .AsNoTracking()
            .Where(bw => bw.Template.IsActive)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Active = g.Count(bw => bw.IsActive)
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Query 3: Execution statistics (database aggregation)
        var executionStats = await _context.WorkflowExecutions
            .AsNoTracking()
            .Where(e => e.BusinessWorkflow.Template.IsActive)
            .GroupBy(_ => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Successful = g.Count(e => e.Status == WorkflowStatus.Complete),
                Failed = g.Count(e => e.Status == WorkflowStatus.Error)
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Query 4: Average execution time (fetch minimal data then calculate in-memory)
        var executionTimes = await _context.WorkflowExecutions
            .AsNoTracking()
            .Where(e => e.BusinessWorkflow.Template.IsActive)
            .Where(e => e.CompletedAt.HasValue && e.StartedAt.HasValue)
            .Select(e => new { e.StartedAt, e.CompletedAt })
            .ToListAsync(cancellationToken);

        var avgExecutionTime = executionTimes.Count > 0
            ? executionTimes.Average(e => (e.CompletedAt!.Value - e.StartedAt!.Value).TotalSeconds)
            : 0;

        // Query 5: Top templates by execution count (database aggregation)
        var topTemplates = await _context.WorkflowTemplates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .Select(t => new TemplateUsageDto
            {
                TemplateId = t.Id,
                Name = t.Name,
                Executions = t.BusinessWorkflows
                    .SelectMany(bw => bw.Executions)
                    .Count(),
                SuccessRate = t.BusinessWorkflows.SelectMany(bw => bw.Executions).Any()
                    ? (double)t.BusinessWorkflows
                        .SelectMany(bw => bw.Executions)
                        .Count(e => e.Status == WorkflowStatus.Complete) * 100 /
                      t.BusinessWorkflows.SelectMany(bw => bw.Executions).Count()
                    : 0
            })
            .OrderByDescending(t => t.Executions)
            .Take(10)
            .ToListAsync(cancellationToken);

        var totalExecutions = executionStats?.Total ?? 0;
        var successfulExecutions = executionStats?.Successful ?? 0;
        var failedExecutions = executionStats?.Failed ?? 0;
        var successRate = totalExecutions > 0
            ? (double)successfulExecutions / totalExecutions * 100
            : 0;

        return new WorkflowAnalyticsDto
        {
            TotalTemplates = templateCounts,
            ActiveTemplates = templateCounts,
            TotalBusinessWorkflows = workflowCounts?.Total ?? 0,
            ActiveBusinessWorkflows = workflowCounts?.Active ?? 0,
            TotalExecutions = totalExecutions,
            SuccessfulExecutions = successfulExecutions,
            FailedExecutions = failedExecutions,
            OverallSuccessRate = successRate,
            AverageExecutionTime = avgExecutionTime,
            TopTemplates = topTemplates,
            ExecutionTrend = []
        };
    }

    private static WorkflowTemplateDto MapToDto(WorkflowTemplate template)
    {
        return new WorkflowTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            Category = template.Category.ToString(),
            IsActive = template.IsActive,
            IsGlobalTemplate = template.IsGlobalTemplate,
            AssignedToPlans = template.PlanAssignments
                .Select(pa => pa.PlanTier.ToString())
                .ToList(),
            RequiresApproval = template.RequiresApproval,
            DefaultTrigger = System.Text.Json.JsonSerializer.Deserialize<object>(template.DefaultTrigger),
            DefaultSteps = string.IsNullOrEmpty(template.DefaultSteps)
                ? null
                : System.Text.Json.JsonSerializer.Deserialize<IReadOnlyCollection<object>>(template.DefaultSteps),
            ConfigurableFields = string.IsNullOrEmpty(template.ConfigurableFields)
                ? null
                : System.Text.Json.JsonSerializer.Deserialize<IReadOnlyCollection<string>>(template.ConfigurableFields),
            TotalBusinesses = template.BusinessWorkflows?.Count ?? 0,
            TotalExecutions = template.BusinessWorkflows?
                .SelectMany(bw => bw.Executions)
                .Count() ?? 0,
            Version = template.Version,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };
    }
}
