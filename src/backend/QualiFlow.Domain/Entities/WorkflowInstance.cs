using QualiFlow.Domain.Common;
using QualiFlow.Domain.Enums;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a running or completed instance of a workflow.
/// Tracks the execution state, progress, and results.
/// </summary>
public class WorkflowInstance : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant ID) for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the workflow definition ID this instance was created from.
    /// </summary>
    public Guid WorkflowDefinitionId { get; set; }

    /// <summary>
    /// Gets or sets the Workflow Core workflow instance ID.
    /// This is the ID used by Workflow Core to track the workflow execution.
    /// </summary>
    public string WorkflowCoreId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the workflow execution status.
    /// Values: Pending, Running, Suspended, Complete, Terminated, Error.
    /// </summary>
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Pending;

    /// <summary>
    /// Gets or sets the workflow execution data as JSON.
    /// Contains input parameters, intermediate results, and output data.
    /// </summary>
    public string DataJson { get; set; } = "{}";

    /// <summary>
    /// Gets or sets when the workflow execution started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Gets or sets when the workflow execution completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Gets or sets the error message if the workflow failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the current step ID being executed.
    /// </summary>
    public string? CurrentStepId { get; set; }

    /// <summary>
    /// Gets or sets the current step name being executed.
    /// </summary>
    public string? CurrentStepName { get; set; }

    /// <summary>
    /// Gets or sets the lead ID if this workflow is associated with a lead.
    /// </summary>
    public Guid? LeadId { get; set; }

    /// <summary>
    /// Gets or sets the conversation ID if this workflow is associated with a conversation.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the user ID who triggered this workflow (if manually triggered).
    /// </summary>
    public Guid? TriggeredByUserId { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this workflow instance belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the workflow definition this instance was created from.
    /// </summary>
    public WorkflowDefinition WorkflowDefinition { get; set; } = null!;

    /// <summary>
    /// Gets or sets the lead this workflow is associated with.
    /// </summary>
    public Lead? Lead { get; set; }

    /// <summary>
    /// Gets or sets the conversation this workflow is associated with.
    /// </summary>
    public Conversation? Conversation { get; set; }

    /// <summary>
    /// Gets or sets the user who triggered this workflow.
    /// </summary>
    public ApplicationUser? TriggeredByUser { get; set; }
}

