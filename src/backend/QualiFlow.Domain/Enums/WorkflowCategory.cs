namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the category of a workflow.
/// </summary>
public enum WorkflowCategory
{
    /// <summary>
    /// Lead qualification workflow.
    /// </summary>
    LeadQualification = 0,

    /// <summary>
    /// Email nurture campaign workflow.
    /// </summary>
    EmailNurture = 1,

    /// <summary>
    /// Follow-up sequence workflow.
    /// </summary>
    FollowUp = 2,

    /// <summary>
    /// Custom workflow created by user.
    /// </summary>
    Custom = 3
}

