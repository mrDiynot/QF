namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the trigger type for a workflow.
/// </summary>
public enum WorkflowTriggerType
{
    /// <summary>
    /// Workflow is triggered manually by a user.
    /// </summary>
    Manual = 0,

    /// <summary>
    /// Workflow is triggered on a schedule (cron expression).
    /// </summary>
    Scheduled = 1,

    /// <summary>
    /// Workflow is triggered by an event (lead created, message received, etc.).
    /// </summary>
    Event = 2
}

