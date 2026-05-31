// -----------------------------------------------------------------------
// <copyright file="SmsTemplate.cs" company="QualiFlow">
//     Copyright (c) QualiFlow. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// SMS message template for quick responses and automated messaging.
/// </summary>
public class SmsTemplate : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID this template belongs to.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template content with variable placeholders.
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template category.
    /// </summary>
    public string Category { get; set; } = "General";

    /// <summary>
    /// Gets or sets the number of times this template has been used.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Gets or sets the navigation property to Business.
    /// </summary>
    public virtual Business? Business { get; set; }
}
