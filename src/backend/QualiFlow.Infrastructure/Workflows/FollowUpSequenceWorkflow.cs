// <copyright file="FollowUpSequenceWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for automated follow-up sequence based on lead score.
/// Sends follow-up emails at scheduled intervals based on priority.
/// </summary>
public class FollowUpSequenceWorkflow : IWorkflow<FollowUpSequenceWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "follow-up-sequence-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<FollowUpSequenceWorkflowData> builder)
    {
        builder
            .StartWith(context => ExecutionResult.Next())
            .If(data => data.LeadScore >= 80)
                .Do(then => then
                    .StartWith<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => "sales@qualiflow.com")
                        .Input(step => step.Subject, data => "High Priority Follow-up")
                        .Input(step => step.HtmlBody, data => "<p>Immediate follow-up</p>")
                    .Delay(data => TimeSpan.FromHours(24))
                    .Then<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => "sales@qualiflow.com")
                        .Input(step => step.Subject, data => "Second Follow-up")
                        .Input(step => step.HtmlBody, data => "<p>24-hour follow-up</p>"))
            .If(data => data.LeadScore >= 50 && data.LeadScore < 80)
                .Do(then => then
                    .StartWith(context => ExecutionResult.Next())
                    .Delay(data => TimeSpan.FromDays(3))
                    .Then<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => "sales@qualiflow.com")
                        .Input(step => step.Subject, data => "Medium Priority Follow-up")
                        .Input(step => step.HtmlBody, data => "<p>3-day follow-up</p>")
                    .Delay(data => TimeSpan.FromDays(7))
                    .Then<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => "sales@qualiflow.com")
                        .Input(step => step.Subject, data => "Second Follow-up")
                        .Input(step => step.HtmlBody, data => "<p>7-day follow-up</p>"))
            .If(data => data.LeadScore < 50)
                .Do(then => then
                    .StartWith(context => ExecutionResult.Next())
                    .Delay(data => TimeSpan.FromDays(7))
                    .Then<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => "sales@qualiflow.com")
                        .Input(step => step.Subject, data => "Low Priority Follow-up")
                        .Input(step => step.HtmlBody, data => "<p>7-day follow-up</p>"));
    }
}

/// <summary>
/// Data model for Follow-Up Sequence Workflow.
/// </summary>
public class FollowUpSequenceWorkflowData
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
    /// Gets or sets the lead score.
    /// </summary>
    public int LeadScore { get; set; }
}

