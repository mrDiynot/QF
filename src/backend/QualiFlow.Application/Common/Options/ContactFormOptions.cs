// Copyright (c) QualiFlow. All Rights Reserved.
// Licensed under the Proprietary License. See LICENSE in the project root for license information.

namespace QualiFlow.Application.Common.Options;

/// <summary>
/// Configuration options for contact form email notifications.
/// </summary>
public class ContactFormOptions
{
    /// <summary>
    /// Configuration section name.
    /// </summary>
    public const string SectionName = "ContactForm";

    /// <summary>
    /// Gets or sets the destination email address for contact form submissions.
    /// </summary>
    public string DestinationEmail { get; set; } = "info@qualiflow.ai";

    /// <summary>
    /// Gets or sets the from email address for contact form notifications.
    /// </summary>
    public string FromEmail { get; set; } = "noreply@qualiflow.ai";

    /// <summary>
    /// Gets or sets the from name for contact form notifications.
    /// </summary>
    public string FromName { get; set; } = "QualiflowAI Contact Form";

    /// <summary>
    /// Gets or sets the subject prefix for contact form emails.
    /// </summary>
    public string SubjectPrefix { get; set; } = "[Contact Form]";

    /// <summary>
    /// Gets or sets the CC email addresses for contact form notifications (comma-separated for multiple).
    /// </summary>
    public string? CcEmail { get; set; }
}
