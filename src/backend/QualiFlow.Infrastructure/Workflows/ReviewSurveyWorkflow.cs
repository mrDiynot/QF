// <copyright file="ReviewSurveyWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for post-appointment review and survey collection.
/// Sends thank-you message, review request, and optional survey after completed appointments.
/// </summary>
public class ReviewSurveyWorkflow : IWorkflow<ReviewSurveyWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "review-survey-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<ReviewSurveyWorkflowData> builder)
    {
        builder

            .StartWith<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Thank you for your appointment!")
                .Input(step => step.HtmlBody, data => $"<h1>Thank you!</h1><p>Dear {data.LeadName},</p><p>Thank you for your recent appointment with us. We appreciate your business!</p>")
            .Delay(data => TimeSpan.FromHours(24))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "How was your experience?")
                .Input(step => step.HtmlBody, data => $"<h1>We'd love your feedback!</h1><p>Dear {data.LeadName},</p><p>We hope you had a great experience. Would you mind leaving us a review?</p>")
            .Delay(data => TimeSpan.FromDays(3))
            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.LeadEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Quick feedback survey - 2 minutes")
                .Input(step => step.HtmlBody, data => $"<h1>Help us improve!</h1><p>Dear {data.LeadName},</p><p>Your opinion matters! Take our 2-minute survey to help us serve you better.</p>");
    }
}

/// <summary>
/// Data model for Review Survey Workflow.
/// </summary>
public class ReviewSurveyWorkflowData
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
}
