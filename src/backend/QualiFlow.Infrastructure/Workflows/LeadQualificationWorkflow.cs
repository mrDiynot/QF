// <copyright file="LeadQualificationWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for automated lead qualification process.
/// Steps: Send Welcome Email → Wait for Response → Score Lead → Assign to Sales or Send Nurture Email.
/// </summary>
public class LeadQualificationWorkflow : IWorkflow<LeadQualificationWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "lead-qualification-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<LeadQualificationWorkflowData> builder)
    {
        builder
            .StartWith<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Welcome to QualiFlow!")
                .Input(step => step.HtmlBody, data => "<h1>Welcome!</h1><p>Thank you for your interest.</p>")
                .Output(data => data.WelcomeEmailId, step => step.EmailId)
            .WaitFor("lead-response", data => data.LeadId.ToString())
                .Output(data => data.LeadResponse, step => step.EventData)
            .Then<ScoreLeadActivity>()
                .Input(step => step.LeadId, data => data.LeadId)
                .Input(step => step.BusinessId, data => data.BusinessId)
                .Output(data => data.LeadScore, step => step.Score)
                .Output(data => data.IsQualified, step => step.IsQualified)
            .If(data => data.LeadScore >= 70)
                .Do(then => then
                    .StartWith<AssignLeadActivity>()
                        .Input(step => step.LeadId, data => data.LeadId)
                        .Input(step => step.BusinessId, data => data.BusinessId)
                        .Output(data => data.AssignedToSales, step => step.Success))
            .If(data => data.LeadScore < 70)
                .Do(then => then
                    .StartWith<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.LeadEmail)
                        .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                        .Input(step => step.FromName, data => EmailConstants.FromName)
                        .Input(step => step.Subject, data => "Let's stay in touch")
                        .Input(step => step.HtmlBody, data => "<p>We'd love to learn more about your needs.</p>")
                        .Output(data => data.NurtureEmailId, step => step.EmailId));
    }
}

/// <summary>
/// Data model for Lead Qualification Workflow.
/// </summary>
public class LeadQualificationWorkflowData
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
    /// Gets or sets the welcome email ID.
    /// </summary>
    public string? WelcomeEmailId { get; set; }

    /// <summary>
    /// Gets or sets the lead response data.
    /// </summary>
    public string? LeadResponse { get; set; }

    /// <summary>
    /// Gets or sets the calculated lead score.
    /// </summary>
    public int LeadScore { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the lead is qualified.
    /// </summary>
    public bool IsQualified { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the lead was assigned to sales.
    /// </summary>
    public bool AssignedToSales { get; set; }

    /// <summary>
    /// Gets or sets the nurture email ID.
    /// </summary>
    public string? NurtureEmailId { get; set; }
}

