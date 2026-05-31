// <copyright file="SendEmailActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Application.Features.Email.DTOs;
using QualiFlow.Application.Features.Email.Services;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for sending emails via Resend.
/// </summary>
public class SendEmailActivity : StepBodyAsync
{
    private readonly IEmailService _emailService;

    /// <summary>
    /// Initializes a new instance of the <see cref="SendEmailActivity"/> class.
    /// </summary>
    /// <param name="emailService">The email service.</param>
    public SendEmailActivity(IEmailService emailService)
    {
        _emailService = emailService;
    }

    /// <summary>
    /// Gets or sets the recipient email address.
    /// </summary>
    public required string ToEmail { get; set; }

    /// <summary>
    /// Gets or sets the recipient name.
    /// </summary>
    public string? ToName { get; set; }

    /// <summary>
    /// Gets or sets the sender email address.
    /// </summary>
    public required string FromEmail { get; set; }

    /// <summary>
    /// Gets or sets the sender name.
    /// </summary>
    public string? FromName { get; set; }

    /// <summary>
    /// Gets or sets the email subject.
    /// </summary>
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the HTML email body.
    /// </summary>
    public required string HtmlBody { get; set; }

    /// <summary>
    /// Gets or sets the plain text email body.
    /// </summary>
    public string? TextBody { get; set; }

    /// <summary>
    /// Gets or sets the Resend email ID (output).
    /// </summary>
    public string? EmailId { get; set; }

    /// <summary>
    /// Executes the activity to send an email.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result.</returns>
    public override async Task<ExecutionResult> RunAsync(IStepExecutionContext context)
    {
        var request = new SendEmailRequest
        {
            ToEmail = ToEmail,
            ToName = ToName,
            FromEmail = FromEmail,
            FromName = FromName,
            Subject = Subject,
            HtmlBody = HtmlBody,
            TextBody = TextBody,
        };

        EmailId = await _emailService.SendEmailAsync(request, CancellationToken.None);

        return ExecutionResult.Next();
    }
}

