// <copyright file="WorkflowRepository.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using QualiFlow.Application.Common.Interfaces;
using QualiFlow.Domain.Entities;
using QualiFlow.Infrastructure.Data;

namespace QualiFlow.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for workflow management operations.
/// </summary>
public class WorkflowRepository : IQualiFlowWorkflowRepository
{
    private readonly QualiFlowDbContext _context;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowRepository"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    public WorkflowRepository(QualiFlowDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<WorkflowDefinition?> GetWorkflowDefinitionByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.WorkflowDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<WorkflowDefinition>> GetWorkflowDefinitionsByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return await _context.WorkflowDefinitions
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<WorkflowDefinition> CreateWorkflowDefinitionAsync(WorkflowDefinition workflowDefinition, CancellationToken cancellationToken)
    {
        await _context.WorkflowDefinitions.AddAsync(workflowDefinition, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return workflowDefinition;
    }

    /// <inheritdoc/>
    public async Task UpdateWorkflowDefinitionAsync(WorkflowDefinition workflowDefinition, CancellationToken cancellationToken)
    {
        _context.WorkflowDefinitions.Update(workflowDefinition);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteWorkflowDefinitionAsync(Guid id, CancellationToken cancellationToken)
    {
        var workflowDefinition = await _context.WorkflowDefinitions.FindAsync(new object[] { id }, cancellationToken);
        if (workflowDefinition != null)
        {
            _context.WorkflowDefinitions.Remove(workflowDefinition);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance?> GetWorkflowInstanceByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.WorkflowInstances
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance?> GetWorkflowInstanceByWorkflowCoreIdAsync(string workflowCoreId, CancellationToken cancellationToken)
    {
        return await _context.WorkflowInstances
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.WorkflowCoreId == workflowCoreId, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<WorkflowInstance>> GetWorkflowInstancesByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return await _context.WorkflowInstances
            .AsNoTracking()
            .Where(w => w.BusinessId == businessId)
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<WorkflowInstance> CreateWorkflowInstanceAsync(WorkflowInstance workflowInstance, CancellationToken cancellationToken)
    {
        await _context.WorkflowInstances.AddAsync(workflowInstance, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return workflowInstance;
    }

    /// <inheritdoc/>
    public async Task UpdateWorkflowInstanceAsync(WorkflowInstance workflowInstance, CancellationToken cancellationToken)
    {
        _context.WorkflowInstances.Update(workflowInstance);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteWorkflowInstanceAsync(Guid id, CancellationToken cancellationToken)
    {
        var workflowInstance = await _context.WorkflowInstances.FindAsync(new object[] { id }, cancellationToken);
        if (workflowInstance != null)
        {
            _context.WorkflowInstances.Remove(workflowInstance);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

