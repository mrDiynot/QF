// <copyright file="AbandonedFormRecoveryWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for recovering leads who started but didn't complete a form.
/// Follows up via email to encourage form completion.
/// </summary>
public class AbandonedFormRecoveryWorkflow : IWorkflow<AbandonedFormRecoveryWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "abandoned-form-recovery-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<AbandonedFormRecoveryWorkflowData> builder)
    {
        builder

            .StartWith<DelayActivity>()
                .Input(step => step.DelayMinutes, data => 10)
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.PartialEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Did something go wrong?")
                .Input(step => step.HtmlBody, data => $"<h1>Need help?</h1><p>Hi there,</p><p>We noticed you started filling out our <strong>{data.FormName}</strong> form but didn't get a chance to finish.</p><p>No worries - we've saved your progress! Pick up right where you left off.</p>")
            .Delay(data => TimeSpan.FromMinutes(30))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.PartialEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Your progress is saved")
                .Input(step => step.HtmlBody, data => $"<h1>Continue where you left off</h1><p>Your progress on the {data.FormName} form is still saved. Complete it now to get started!</p>")
            .Delay(data => TimeSpan.FromHours(24))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.PartialEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Last chance - your saved form expires soon")
                .Input(step => step.HtmlBody, data => $"<h1>Don't lose your progress!</h1><p>Your saved {data.FormName} form data will expire soon. Complete it now!</p>");
    }
}

/// <summary>
/// Data model for Abandoned Form Recovery Workflow.
/// </summary>
public class AbandonedFormRecoveryWorkflowData
{
    /// <summary>
    /// Gets or sets the session ID tracking the form interaction.
    /// </summary>
    public Guid SessionId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the form ID.
    /// </summary>
    public Guid FormId { get; set; }

    /// <summary>
    /// Gets or sets the form name.
    /// </summary>
    public string FormName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the partial email captured from the form.
    /// </summary>
    public string PartialEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the partial name captured from the form.
    /// </summary>
    public string PartialName { get; set; } = string.Empty;
}
