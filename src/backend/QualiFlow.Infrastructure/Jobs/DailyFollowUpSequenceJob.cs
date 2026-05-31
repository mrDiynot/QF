// <copyright file="DailyFollowUpSequenceJob.cs" company="QualiFlow">
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
/// Background job to start follow-up sequence workflows for qualified leads.
/// Runs daily to process leads with status = Qualified.
/// </summary>
public class DailyFollowUpSequenceJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IWorkflowHost _workflowHost;
    private readonly ILogger<DailyFollowUpSequenceJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="DailyFollowUpSequenceJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="logger">The logger.</param>
    public DailyFollowUpSequenceJob(
        QualiFlowDbContext context,
        IWorkflowHost workflowHost,
        ILogger<DailyFollowUpSequenceJob> logger)
    {
        _context = context;
        _workflowHost = workflowHost;
        _logger = logger;
    }

    /// <summary>
    /// Executes the daily follow-up sequence job.
    /// Finds qualified leads and starts follow-up sequence workflows based on lead score.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily follow-up sequence job");

        // Find qualified leads that need follow-up
        // (In production, you'd track which leads already have active follow-up sequences)
        var qualifiedLeads = await _context.Leads
            .Include(l => l.Business)
            .Where(l => l.Status == LeadStatus.Qualified)
            .Take(100) // Limit to 100 leads per run to avoid overwhelming the system
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} qualified leads for follow-up sequence",
            qualifiedLeads.Count);

        var workflowsStarted = 0;

        foreach (var lead in qualifiedLeads)
        {
            // Skip leads for businesses that no longer exist (orphaned data)
            if (lead.Business == null || lead.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping follow-up sequence for lead {LeadId} - business {BusinessId} not found or deleted",
                    lead.Id,
                    lead.BusinessId);
                continue;
            }

            try
            {
                // Create workflow data
                var workflowData = new FollowUpSequenceWorkflowData
                {
                    LeadId = lead.Id,
                    BusinessId = lead.BusinessId,
                    LeadEmail = lead.Email,
                    LeadScore = lead.Score,
                };

                // Start the workflow
                var workflowId = await _workflowHost.StartWorkflow(
                    "follow-up-sequence-workflow",
                    1,
                    workflowData);

                _logger.LogInformation(
                    "Started follow-up sequence workflow {WorkflowId} for lead {LeadId} (Score: {Score})",
                    workflowId,
                    lead.Id,
                    lead.Score);

                workflowsStarted++;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error starting follow-up sequence workflow for lead {LeadId}",
                    lead.Id);
            }
        }

        _logger.LogInformation(
            "Daily follow-up sequence job completed. Started {Count} workflows",
            workflowsStarted);
    }
}

