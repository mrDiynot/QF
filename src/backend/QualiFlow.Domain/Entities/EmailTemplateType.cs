namespace QualiFlow.Domain.Entities;

/// <summary>
/// Email template types.
/// </summary>
public enum EmailTemplateType
{
    /// <summary>
    /// Transactional emails (welcome, password reset, etc.).
    /// </summary>
    Transactional,

    /// <summary>
    /// Marketing emails (newsletters, promotions, etc.).
    /// </summary>
    Marketing,

    /// <summary>
    /// Notification emails (lead assigned, booking confirmed, etc.).
    /// </summary>
    Notification,
}

