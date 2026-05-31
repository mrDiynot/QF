// <copyright file="MissedCallRecoveryWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for recovering missed calls.
/// Sends follow-up emails to leads who called but couldn't connect.
/// </summary>
public class MissedCallRecoveryWorkflow : IWorkflow<MissedCallRecoveryWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "missed-call-recovery-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<MissedCallRecoveryWorkflowData> builder)
    {
        builder

            .StartWith<DelayActivity>()
                .Input(step => step.DelayMinutes, data => 5)
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "We tried to reach you")
                .Input(step => step.HtmlBody, data => $"<h1>Sorry we missed you!</h1><p>Hi {data.LeadName},</p><p>We're sorry we couldn't connect on your recent call. We'd love to help you!</p><p>Reply to this email or call us back at your convenience.</p>")
            .Delay(data => TimeSpan.FromHours(2))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Schedule a callback at your convenience")
                .Input(step => step.HtmlBody, data => $"<h1>Let's schedule a time that works for you</h1><p>Hi {data.LeadName},</p><p>Pick a time that works best for you and we'll call you back.</p>");
    }
}

/// <summary>
/// Data model for Missed Call Recovery Workflow.
/// </summary>
public class MissedCallRecoveryWorkflowData
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
    /// Gets or sets the missed call timestamp.
    /// </summary>
    public DateTime MissedCallAt { get; set; }
}
