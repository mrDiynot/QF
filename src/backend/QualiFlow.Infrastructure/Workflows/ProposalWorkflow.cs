// <copyright file="ProposalWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Enums;
using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for proposal creation, sending, and tracking.
/// Manages the full proposal lifecycle from creation to acceptance.
/// </summary>
public class ProposalWorkflow : IWorkflow<ProposalWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "proposal-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<ProposalWorkflowData> builder)
    {
        builder

            .StartWith<UpdateLeadActivity>()
                .Input(step => step.LeadId, data => data.LeadId)
                .Input(step => step.BusinessId, data => data.BusinessId)
                .Input(step => step.NewStatus, data => LeadStatus.Qualified)
                .Input(step => step.Notes, data => "Proposal workflow started")
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => $"Your Proposal from {data.BusinessName}")
                .Input(step => step.HtmlBody, data => $"<h1>Your Proposal is Ready!</h1><p>Hi {data.LeadName},</p><p>Thank you for your interest. We're excited to present our proposal valued at ${data.ProposalAmount:N0}.</p><p>Valid until {data.ExpirationDate:MMMM dd, yyyy}.</p>")
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.SalesRepEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => $"Proposal Sent: {data.LeadName}")
                .Input(step => step.HtmlBody, data => $"<h1>Proposal Sent</h1><p>A proposal has been sent to {data.LeadName}.</p><p>Value: ${data.ProposalAmount:N0}</p>")
            .Delay(data => TimeSpan.FromHours(24))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Your proposal is waiting!")
                .Input(step => step.HtmlBody, data => $"<h1>Don't forget your proposal</h1><p>Hi {data.LeadName},</p><p>Just a friendly reminder that your proposal is ready for review.</p>")
            .Delay(data => TimeSpan.FromDays(5))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Any questions about your proposal?")
                .Input(step => step.HtmlBody, data => $"<h1>We're here to help</h1><p>Hi {data.LeadName},</p><p>I wanted to check in and see if you have any questions about the proposal. Happy to discuss!</p>");
    }
}

/// <summary>
/// Data model for Proposal Workflow.
/// </summary>
public class ProposalWorkflowData
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
    /// Gets or sets the proposal ID.
    /// </summary>
    public Guid ProposalId { get; set; }

    /// <summary>
    /// Gets or sets the lead name.
    /// </summary>
    public string LeadName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the lead email.
    /// </summary>
    public string LeadEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the business name.
    /// </summary>
    public string BusinessName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the sales rep email.
    /// </summary>
    public string SalesRepEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the proposal amount.
    /// </summary>
    public decimal ProposalAmount { get; set; }

    /// <summary>
    /// Gets or sets the proposal expiration date.
    /// </summary>
    public DateTime ExpirationDate { get; set; }
}
