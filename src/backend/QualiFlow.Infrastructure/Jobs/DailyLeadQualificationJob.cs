// <copyright file="DailyLeadQualificationJob.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QualiFlow.Domain.Entities;
using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Data;
using QualiFlow.Infrastructure.Workflows;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Jobs;

/// <summary>
/// Background job to start lead qualification workflows for new leads.
/// Runs daily to process leads created in the last 24 hours.
/// </summary>
public class DailyLeadQualificationJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IWorkflowHost _workflowHost;
    private readonly ILogger<DailyLeadQualificationJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="DailyLeadQualificationJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="logger">The logger.</param>
    public DailyLeadQualificationJob(
        QualiFlowDbContext context,
        IWorkflowHost workflowHost,
        ILogger<DailyLeadQualificationJob> logger)
    {
        _context = context;
        _workflowHost = workflowHost;
        _logger = logger;
    }

    /// <summary>
    /// Executes the daily lead qualification job.
    /// Finds new leads created in the last 24 hours and starts qualification workflows.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily lead qualification job");

        var yesterday = DateTime.UtcNow.AddDays(-1);

        // Find new leads created in the last 24 hours with status = New
        // Include Business to check for orphaned leads
        var newLeads = await _context.Leads
            .Include(l => l.Business)
            .Where(l => l.CreatedAt >= yesterday && l.Status == LeadStatus.New)
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} new leads to qualify",
            newLeads.Count);

        var workflowsStarted = 0;

        foreach (var lead in newLeads)
        {
            // Skip leads for businesses that no longer exist (orphaned data)
            if (lead.Business == null || lead.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping lead qualification for lead {LeadId} - business {BusinessId} not found or deleted",
                    lead.Id,
                    lead.BusinessId);
                continue;
            }

            try
            {
                // Create workflow data
                var workflowData = new LeadQualificationWorkflowData
                {
                    LeadId = lead.Id,
                    BusinessId = lead.BusinessId,
                    LeadEmail = lead.Email,
                };

                // Start the workflow
                var workflowId = await _workflowHost.StartWorkflow(
                    "lead-qualification-workflow",
                    1,
                    workflowData);

                _logger.LogInformation(
                    "Started lead qualification workflow {WorkflowId} for lead {LeadId}",
                    workflowId,
                    lead.Id);

                workflowsStarted++;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error starting lead qualification workflow for lead {LeadId}",
                    lead.Id);
            }
        }

        _logger.LogInformation(
            "Daily lead qualification job completed. Started {Count} workflows",
            workflowsStarted);
    }
}

