// <copyright file="RetentionReengagementWorkflow.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Infrastructure.Constants;
using QualiFlow.Infrastructure.Workflows.Activities;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows;

/// <summary>
/// Workflow for retaining and re-engaging inactive customers.
/// Targets customers based on their lifetime value with personalized offers.
/// </summary>
public class RetentionReengagementWorkflow : IWorkflow<RetentionReengagementWorkflowData>
{
    /// <summary>
    /// Gets the workflow ID.
    /// </summary>
    public string Id => "retention-reengagement-workflow";

    /// <summary>
    /// Gets the workflow version.
    /// </summary>
    public int Version => 1;

    /// <summary>
    /// Builds the workflow definition.
    /// </summary>
    /// <param name="builder">The workflow builder.</param>
    public void Build(IWorkflowBuilder<RetentionReengagementWorkflowData> builder)
    {
        builder
            .StartWith(context => ExecutionResult.Next())

            // High-value customers get VIP treatment
            .If(data => data.LifetimeValue >= 1000)
                .Do(highValue => highValue
                    .StartWith<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.CustomerEmail)
                        .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                        .Input(step => step.FromName, data => EmailConstants.FromName)
                        .Input(step => step.Subject, data => $"VIP Offer: We value you, {data.CustomerName}!")
                        .Input(step => step.HtmlBody, data => $"<h1>You're a VIP!</h1><p>Hi {data.CustomerName},</p><p>As one of our most valued customers, we have an exclusive 25% discount just for you. Use code: VIP25</p>"))

            // Medium-value customers get standard re-engagement
            .If(data => data.LifetimeValue >= 100 && data.LifetimeValue < 1000)
                .Do(mediumValue => mediumValue
                    .StartWith<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.CustomerEmail)
                        .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                        .Input(step => step.FromName, data => EmailConstants.FromName)
                        .Input(step => step.Subject, data => "We miss you! Here's a special offer")
                        .Input(step => step.HtmlBody, data => $"<h1>We miss you!</h1><p>Hi {data.CustomerName},</p><p>It's been a while. Here's 15% off your next order. Use code: COMEBACK15</p>"))

            // Low-value customers get promotional content
            .If(data => data.LifetimeValue < 100)
                .Do(lowValue => lowValue
                    .StartWith<SendEmailActivity>()
                        .Input(step => step.ToEmail, data => data.CustomerEmail)
                        .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                        .Input(step => step.FromName, data => EmailConstants.FromName)
                        .Input(step => step.Subject, data => "See what's new!")
                        .Input(step => step.HtmlBody, data => $"<h1>Check out what's new!</h1><p>Hi {data.CustomerName},</p><p>We've been busy making improvements. Come see what's new!</p>"))

            // Wait 7 days then send final follow-up
            .Delay(data => TimeSpan.FromDays(7))

            .Then<SendEmailActivity>()
                .Input(step => step.ToEmail, data => data.CustomerEmail)
                .Input(step => step.FromEmail, data => EmailConstants.NoReplyEmail)
                .Input(step => step.FromName, data => EmailConstants.FromName)
                .Input(step => step.Subject, data => "Last chance for your exclusive offer")
                .Input(step => step.HtmlBody, data => $"<h1>Don't miss out!</h1><p>Hi {data.CustomerName},</p><p>Your special offer expires tomorrow. Don't miss this chance!</p>");
    }
}

/// <summary>
/// Data model for Retention Re-engagement Workflow.
/// </summary>
public class RetentionReengagementWorkflowData
{
    /// <summary>
    /// Gets or sets the customer/lead ID.
    /// </summary>
    public Guid CustomerId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the customer email address.
    /// </summary>
    public string CustomerEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the customer name.
    /// </summary>
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the customer lifetime value.
    /// </summary>
    public decimal LifetimeValue { get; set; }

    /// <summary>
    /// Gets or sets the days since last engagement.
    /// </summary>
    public int DaysSinceLastEngagement { get; set; }
}
