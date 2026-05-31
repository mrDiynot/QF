// <copyright file="WorkflowExecution.cs" company="QualiFlow">
// Copyright (c) QualiFlow. All rights reserved.
// </copyright>

using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a single execution of a business workflow.
/// Tracks detailed execution progress, timing, and results.
/// </summary>
public class WorkflowExecution : BaseEntity
{
    /// <summary>
    /// Gets or sets the business workflow ID.
    /// </summary>
    public Guid BusinessWorkflowId { get; set; }

    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the WorkflowCore instance ID.
    /// </summary>
    public string? WorkflowCoreInstanceId { get; set; }

    /// <summary>
    /// Gets or sets the execution status.
    /// </summary>
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Pending;

    /// <summary>
    /// Gets or sets when the execution started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the execution completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the execution duration in seconds.
    /// </summary>
    public int? DurationSeconds { get; set; }

    /// <summary>
    /// Gets or sets the number of steps completed.
    /// </summary>
    public int StepsCompleted { get; set; }

    /// <summary>
    /// Gets or sets the total number of steps.
    /// </summary>
    public int StepsTotal { get; set; }

    /// <summary>
    /// Gets or sets the current step being executed.
    /// </summary>
    public string? CurrentStep { get; set; }

    /// <summary>
    /// Gets or sets the execution input data as JSON.
    /// </summary>
    public string InputData { get; set; } = "{}";

    /// <summary>
    /// Gets or sets the execution output/result data as JSON.
    /// </summary>
    public string? ResultData { get; set; }

    /// <summary>
    /// Gets or sets the error message if execution failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the error stack trace if execution failed.
    /// </summary>
    public string? ErrorStackTrace { get; set; }

    /// <summary>
    /// Gets or sets the lead ID if associated with a lead.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID if associated with a conversation.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who triggered this execution.
    /// </summary>
    public Guid? TriggeredByUserId { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business workflow this execution belongs to.
    /// </summary>
    public BusinessWorkflow BusinessWorkflow { get; set; } = null!;

    /// <summary>
    /// Gets or sets the business this execution belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead if associated.
    /// </summary>
    public Lead? Lead { get; set; }

    /// <summary>
    /// Gets or sets the conversation if associated.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the user who triggered this execution.
    /// </summary>
    public ApplicationUser? TriggeredByUser { get; set; }
}
