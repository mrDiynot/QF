// <copyright file="NoShowRecoveryWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for recovering customers who miss their appointments.
/// Sends follow-up emails offering rescheduling options.
/// </summary>
public class NoShowRecoveryWorkflow : IWorkflow<NoShowRecoveryWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "no-show-recovery-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<NoShowRecoveryWorkflowData> builder)
    {
        builder

            .StartWith<DelayActivity>()
                .Input(step => step.DelayMinutes, data => 15)
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "We missed you today - Let's reschedule")
                .Input(step => step.HtmlBody, data => $"<h1>We missed you!</h1><p>Hi {data.LeadName},</p><p>We noticed you couldn't make your appointment scheduled for {data.ScheduledAt:MMMM dd, yyyy} at {data.ScheduledAt:h:mm tt}.</p><p>No worries! Life happens. Would you like to reschedule?</p>")
            .Delay(data => TimeSpan.FromHours(24))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Special offer to reschedule")
                .Input(step => step.HtmlBody, data => $"<h1>We want you back!</h1><p>Hi {data.LeadName},</p><p>We understand schedules can be tricky. Book within the next 48 hours and receive a special offer!</p>")
            .Then<UpdateLeadActivity>()
                .Input(step => step.LeadId, data => data.LeadId)
                .Input(step => step.BusinessId, data => data.BusinessId)
                .Input(step => step.Notes, data => "No-show recovery workflow completed");
    }
}

/// <summary>
/// Data model for No-Show Recovery Workflow.
/// </summary>
public class NoShowRecoveryWorkflowData
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
    /// Gets or sets the appointment ID.
    /// </summary>
    public Guid AppointmentId { get; set; }

    /// <summary>
    /// Gets or sets the scheduled appointment time.
    /// </summary>
    public DateTime ScheduledAt { get; set; }
}
