namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a form.
/// </summary>
public enum FormStatus
{
    /// <summary>
    /// Form is in draft mode and not accepting submissions.
    /// </summary>
    Draft = 0,

    /// <summary>
    /// Form is published and accepting submissions.
    /// </summary>
    Published = 1,

    /// <summary>
    /// Form is archived and no longer active.
    /// </summary>
    Archived = 2
}

