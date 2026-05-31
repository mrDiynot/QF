using QualiFlow.Domain.Common;

namespace QualiFlow.Domain.Entities;

/// <summary>
/// Represents a log entry for an email sent via Resend.
/// Tracks delivery status, opens, clicks, and bounces.
/// </summary>
public class EmailLog : BaseEntity
{
    /// <summary>
    /// Gets or sets the business ID (tenant).
    /// REQUIRED for multi-tenancy.
    /// </summary>
    public Guid BusinessId { get; set; }

    /// <summary>
    /// Gets or sets the email template ID (optional).
    /// </summary>
    public Guid? EmailTemplateId { get; set; }

    /// <summary>
    /// Gets or sets the Resend email ID.
    /// </summary>
    public string ResendEmailId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the recipient email address.
    /// </summary>
    public string ToEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the recipient name.
    /// </summary>
    public string? ToName { get; set; }

    /// <summary>
    /// Gets or sets the sender email address.
    /// </summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the sender name.
    /// </summary>
    public string? FromName { get; set; }

    /// <summary>
    /// Gets or sets the email subject.
    /// </summary>
    public string Subject { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the email status.
    /// </summary>
    public EmailStatus Status { get; set; } = EmailStatus.Queued;

    /// <summary>
    /// Gets or sets when the email was sent.
    /// </summary>
    public DateTime? SentAt { get; set; }

    /// <summary>
    /// Gets or sets when the email was delivered.
    /// </summary>
    public DateTime? DeliveredAt { get; set; }

    /// <summary>
    /// Gets or sets when the email was opened (first open).
    /// </summary>
    public DateTime? OpenedAt { get; set; }

    /// <summary>
    /// Gets or sets the number of times the email was opened.
    /// </summary>
    public int OpenCount { get; set; }

    /// <summary>
    /// Gets or sets when the email was clicked (first click).
    /// </summary>
    public DateTime? ClickedAt { get; set; }

    /// <summary>
    /// Gets or sets the number of times links were clicked.
    /// </summary>
    public int ClickCount { get; set; }

    /// <summary>
    /// Gets or sets when the email bounced.
    /// </summary>
    public DateTime? BouncedAt { get; set; }

    /// <summary>
    /// Gets or sets the bounce reason.
    /// </summary>
    public string? BounceReason { get; set; }

    /// <summary>
    /// Gets or sets the error message if sending failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    // Navigation properties

    /// <summary>
    /// Gets or sets the business this email log belongs to.
    /// </summary>
    public Business Business { get; set; } = null!;

    /// <summary>
    /// Gets or sets the email template used (optional).
    /// </summary>
    public EmailTemplate? EmailTemplate { get; set; }
}

