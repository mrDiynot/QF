// <copyright file="WeeklyNurtureCampaignJob.cs" company="QualiFlow">
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
/// Background job to start email nurture campaigns for unqualified leads.
/// Runs weekly to process leads with status = Unqualified.
/// </summary>
public class WeeklyNurtureCampaignJob
{
    private readonly QualiFlowDbContext _context;
    private readonly IWorkflowHost _workflowHost;
    private readonly ILogger<WeeklyNurtureCampaignJob> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="WeeklyNurtureCampaignJob"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="workflowHost">The Workflow Core host.</param>
    /// <param name="logger">The logger.</param>
    public WeeklyNurtureCampaignJob(
        QualiFlowDbContext context,
        IWorkflowHost workflowHost,
        ILogger<WeeklyNurtureCampaignJob> logger)
    {
        _context = context;
        _workflowHost = workflowHost;
        _logger = logger;
    }

    /// <summary>
    /// Executes the weekly nurture campaign job.
    /// Finds unqualified leads and starts email nurture campaigns.
    /// </summary>
    /// <returns>A task representing the asynchronous operation.</returns>
    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting weekly nurture campaign job");

        // Find unqualified leads that haven't been nurtured yet
        // (In production, you'd track which leads already have active nurture campaigns)
        var unqualifiedLeads = await _context.Leads
            .Include(l => l.Business)
            .Where(l => l.Status == LeadStatus.Unqualified)
            .Take(100) // Limit to 100 leads per run to avoid overwhelming the system
            .ToListAsync();

        _logger.LogInformation(
            "Found {Count} unqualified leads for nurture campaign",
            unqualifiedLeads.Count);

        var workflowsStarted = 0;

        foreach (var lead in unqualifiedLeads)
        {
            // Skip leads for businesses that no longer exist (orphaned data)
            if (lead.Business == null || lead.Business.DeletedAt != null)
            {
                _logger.LogWarning(
                    "Skipping nurture campaign for lead {LeadId} - business {BusinessId} not found or deleted",
                    lead.Id,
                    lead.BusinessId);
                continue;
            }

            try
            {
                // Create workflow data
                var workflowData = new EmailNurtureCampaignWorkflowData
                {
                    LeadId = lead.Id,
                    BusinessId = lead.BusinessId,
                    LeadEmail = lead.Email,
                    DelayDays = 3, // 3 days between emails
                };

                // Start the workflow
                var workflowId = await _workflowHost.StartWorkflow(
                    "email-nurture-campaign-workflow",
                    1,
                    workflowData);

                _logger.LogInformation(
                    "Started email nurture campaign workflow {WorkflowId} for lead {LeadId}",
                    workflowId,
                    lead.Id);

                workflowsStarted++;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error starting email nurture campaign workflow for lead {LeadId}",
                    lead.Id);
            }
        }

        _logger.LogInformation(
            "Weekly nurture campaign job completed. Started {Count} workflows",
            workflowsStarted);
    }
}

