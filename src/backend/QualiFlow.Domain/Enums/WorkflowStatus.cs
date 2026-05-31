namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the execution status of a workflow instance.
/// </summary>
public enum WorkflowStatus
{
    /// <summary>
    /// Workflow is pending execution.
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Workflow is currently running.
    /// </summary>
    Running = 1,

    /// <summary>
    /// Workflow is suspended (waiting for external event or user action).
    /// </summary>
    Suspended = 2,

    /// <summary>
    /// Workflow completed successfully.
    /// </summary>
    Complete = 3,

    /// <summary>
    /// Workflow was manually terminated.
    /// </summary>
    Terminated = 4,

    /// <summary>
    /// Workflow failed with an error.
    /// </summary>
    Error = 5
}

