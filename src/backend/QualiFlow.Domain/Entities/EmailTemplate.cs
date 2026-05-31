using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents an email template for transactional or marketing emails.
/// </summary>
public class EmailTemplate : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the template name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the template description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the email subject line.
    /// Supports variables: {{firstName}}, {{lastName}}, {{businessName}}, etc.
    /// </summary>
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the HTML email body.
    /// Supports variables: {{firstName}}, {{lastName}}, {{businessName}}, etc.
    /// </summary>
    public string HtmlBody { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the plain text email body (fallback).
    /// </summary>
    public string? TextBody { get; set; }

    /// <summary>
    /// Gets or sets the template type.
    /// </summary>
    public EmailTemplateType Type { get; set; } = EmailTemplateType.Transactional;

    /// <summary>
    /// Gets or sets a value indicating whether this template is active.
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this template belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets the email logs for this template.
    /// </summary>
    public ICollection<EmailLog> EmailLogs { get; } = [];
}

