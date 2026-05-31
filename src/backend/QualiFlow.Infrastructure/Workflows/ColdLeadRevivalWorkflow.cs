// <copyright file="ColdLeadRevivalWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for reactivating cold leads who stopped responding.
/// Uses a series of re-engagement emails over time.
/// </summary>
public class ColdLeadRevivalWorkflow : IWorkflow<ColdLeadRevivalWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "cold-lead-revival-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<ColdLeadRevivalWorkflowData> builder)
    {
        builder

            .StartWith<UpdateLeadActivity>()
                .Input(step => step.LeadId, data => data.LeadId)
                .Input(step => step.BusinessId, data => data.BusinessId)
                .Input(step => step.NewStatus, data => LeadStatus.Contacted)
                .Input(step => step.Notes, data => "Cold lead revival workflow started")
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => $"It's been a while, {data.LeadName}!")
                .Input(step => step.HtmlBody, data => $"<h1>We've missed you!</h1><p>Hi {data.LeadName},</p><p>It's been a while since we last connected. A lot has changed - we'd love to catch up!</p>")
            .Delay(data => TimeSpan.FromDays(3))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "What's new at QualiFlow")
                .Input(step => step.HtmlBody, data => $"<h1>Check out what's new!</h1><p>Hi {data.LeadName},</p><p>We've added exciting new features that might interest you.</p>")
            .Delay(data => TimeSpan.FromDays(5))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Exclusive offer just for you")
                .Input(step => step.HtmlBody, data => $"<h1>One last thing...</h1><p>Hi {data.LeadName},</p><p>As a returning lead, we'd like to offer you an exclusive discount. This offer expires in 7 days.</p>");
    }
}

/// <summary>
/// Data model for Cold Lead Revival Workflow.
/// </summary>
public class ColdLeadRevivalWorkflowData
{
    /// <summary>
    /// Gets or sets the lead ID.
    /// </summary>
    public Guid LeadId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the lead email address.
    /// </summary>
    public string LeadEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the lead name.
    /// </summary>
    public string LeadName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of days since last activity.
    /// </summary>
    public int DaysSinceLastActivity { get; set; }
}
