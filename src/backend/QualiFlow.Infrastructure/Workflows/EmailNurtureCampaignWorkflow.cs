// <copyright file="EmailNurtureCampaignWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for automated email nurture campaign.
/// Sends a series of 5 emails with configurable delays between each email.
/// </summary>
public class EmailNurtureCampaignWorkflow : IWorkflow<EmailNurtureCampaignWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "email-nurture-campaign-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<EmailNurtureCampaignWorkflowData> builder)
    {
        builder
            .StartWith<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.Subject, data => "Welcome to QualiFlow!")
                .Input(step => step.HtmlBody, data => "<h1>Welcome!</h1>")
            .Delay(data => TimeSpan.FromDays(data.DelayDays))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.Subject, data => "Discover Our Product")
                .Input(step => step.HtmlBody, data => "<h1>Product Introduction</h1>")
            .Delay(data => TimeSpan.FromDays(data.DelayDays))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.Subject, data => "Success Story")
                .Input(step => step.HtmlBody, data => "<h1>Case Study</h1>")
            .Delay(data => TimeSpan.FromDays(data.DelayDays))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.Subject, data => "Special Offer")
                .Input(step => step.HtmlBody, data => "<h1>Limited Time Offer</h1>")
            .Delay(data => TimeSpan.FromDays(data.DelayDays))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.Subject, data => "Final Follow-up")
                .Input(step => step.HtmlBody, data => "<h1>Let's Connect</h1>");
    }
}

/// <summary>
/// Data model for Email Nurture Campaign Workflow.
/// </summary>
public class EmailNurtureCampaignWorkflowData
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
    /// Gets or sets the delay in days between emails.
    /// </summary>
    public int DelayDays { get; set; } = 3;
}

