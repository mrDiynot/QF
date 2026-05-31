// <copyright file="SendSmsActivity.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using Microsoft.Extensions.Logging;
using QualiFlow.Application.Features.Messages.DTOs;
using QualiFlow.Application.Features.Messages.Services;
using QualiFlow.Domain.Enums;
using WorkflowCore.Interface;
using WorkflowCore.Models;

namespace QualiFlow.Infrastructure.Workflows.Activities;

/// <summary>
/// Workflow activity for sending SMS messages via Twilio.
/// </summary>
public class SendSmsActivity : StepBodyAsync
{
    private readonly IMessageService _messageService;
    private readonly ILogger<SendSmsActivity> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SendSmsActivity"/> class.
    /// </summary>
    /// <param name="messageService">The message service.</param>
    /// <param name="logger">The logger.</param>
    public SendSmsActivity(IMessageService messageService, ILogger<SendSmsActivity> logger)
    {
        _messageService = messageService;
        _logger = logger;
    }

    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the SMS message content.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the message ID (output).
    /// </summary>
    public Guid? MessageId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the SMS was sent successfully (output).
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Executes the activity to send an SMS message.
    /// </summary>
    /// <param name="context">The step execution context.</param>
    /// <returns>The execution result.</returns>
    public override async Task<ExecutionResult> RunAsync(IStepExecutionContext context)
    {
        try
        {
            _logger.LogInformation(
                "Sending SMS for conversation {ConversationId} in business {BusinessId}",
                ConversationId,
                BusinessId);

            var request = new CreateMessageRequest
            {
                ConversationId = ConversationId,
                Content = Content,
                Direction = MessageDirection.Outbound,
            };

            var result = await _messageService.CreateMessageAsync(BusinessId, request, CancellationToken.None);

            MessageId = result.Id;
            Success = true;

            _logger.LogInformation(
                "SMS sent successfully. MessageId: {MessageId}",
                MessageId);

            return ExecutionResult.Next();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS for conversation {ConversationId}", ConversationId);
            Success = false;
            return ExecutionResult.Next();
        }
    }
}
