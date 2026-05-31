namespace QualiFlow.Domain.Enums;

/// <summary>
/// Represents the source/origin of a contact in the CRM.
/// </summary>
public enum ContactSource
{
    /// <summary>
    /// No source defined (default/uninitialized).
    /// </summary>
    None = 0,

    /// <summary>
    /// Contact was manually created by a user.
    /// </summary>
    Manual = 1,

    /// <summary>
    /// Contact was converted from a Lead.
    /// </summary>
    Lead = 2,

    /// <summary>
    /// Contact was imported from a CSV file or bulk import.
    /// </summary>
    Import = 3,

    /// <summary>
    /// Contact was created via API integration.
    /// </summary>
    API = 4,

    /// <summary>
    /// Contact was created from a web form submission.
    /// </summary>
    WebForm = 5
}
