namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the status of a contact in the CRM.
/// </summary>
public enum ContactStatus
{
    /// <summary>
    /// No status defined (default/uninitialized).
    /// </summary>
    None = 0,

    /// <summary>
    /// Contact is active and can be contacted.
    /// </summary>
    Active = 1,

    /// <summary>
    /// Contact is inactive (not actively managed).
    /// </summary>
    Inactive = 2,

    /// <summary>
    /// Contact has requested not to be contacted.
    /// </summary>
    DoNotContact = 3
}
